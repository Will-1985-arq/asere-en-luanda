import { createClient } from "npm:@supabase/supabase-js@2";

const bucketName = "classified-images";
const retentionDays = 60;
const batchSize = 1000;

type Classified = {
  id: string;
  image_url: string | null;
  image_urls: string[] | null;
};

function getStoragePath(imageUrl: string, projectUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(imageUrl);
  } catch {
    throw new Error("Un URL de imagen del anuncio no es válido.");
  }

  if (url.origin !== new URL(projectUrl).origin) return null;

  const prefix = `/storage/v1/object/public/${bucketName}/`;
  if (!url.pathname.startsWith(prefix)) return null;

  let path: string;
  try {
    path = decodeURIComponent(url.pathname.slice(prefix.length));
  } catch {
    throw new Error("La ruta de una imagen del anuncio no es válida.");
  }

  const segments = path.split("/");
  if (!path || segments.some(segment => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
    throw new Error("La ruta de una imagen del anuncio no es válida.");
  }

  return path;
}

Deno.serve(async request => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("CLASSIFIED_CLEANUP_SECRET");
  if (!expectedSecret || request.headers.get("x-cron-secret") !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!projectUrl || !serviceRoleKey) {
    console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    return new Response("Cleanup is not configured", { status: 500 });
  }

  const supabase = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const { data: classifieds, error: selectError } = await supabase
    .from("classifieds")
    .select("id,image_url,image_urls")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (selectError) {
    console.error("No se pudieron consultar los anuncios vencidos:", selectError.message);
    return new Response("Could not load expired classifieds", { status: 500 });
  }

  let deleted = 0;
  const failures: string[] = [];

  for (const classified of (classifieds ?? []) as Classified[]) {
    try {
      const imageUrls = [
        ...(classified.image_urls ?? []),
        ...(classified.image_url ? [classified.image_url] : [])
      ];
      const paths = [...new Set(
        imageUrls
          .filter(Boolean)
          .map(imageUrl => getStoragePath(imageUrl, projectUrl))
          .filter((path): path is string => path !== null)
      )];

      if (paths.length) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(paths);
        if (storageError) throw new Error(`Storage: ${storageError.message}`);
      }

      const { data: removedRows, error: deleteError } = await supabase
        .from("classifieds")
        .delete()
        .eq("id", classified.id)
        .lt("created_at", cutoff)
        .select("id");

      if (deleteError) throw new Error(`Base de datos: ${deleteError.message}`);
      if (removedRows?.length) deleted += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`No se pudo eliminar el anuncio ${classified.id}:`, message);
      failures.push(classified.id);
    }
  }

  const result = {
    cutoff,
    scanned: classifieds?.length ?? 0,
    deleted,
    failed: failures.length,
    failures
  };
  if (failures.length) {
    return Response.json(result, { status: 500 });
  }

  return Response.json(result);
});

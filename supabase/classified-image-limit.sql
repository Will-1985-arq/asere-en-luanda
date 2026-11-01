do $$
begin
    if not exists (
        select 1
        from storage.buckets
        where id = 'classified-images'
    ) then
        raise exception 'No existe el bucket classified-images. Configúralo primero según SUPABASE-SETUP.md.';
    end if;

    update storage.buckets
       set file_size_limit = 102400,
           allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
     where id = 'classified-images';
end;
$$;

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
    if not exists (
        select 1 from vault.decrypted_secrets
        where name = 'classified_cleanup_url'
    ) or not exists (
        select 1 from vault.decrypted_secrets
        where name = 'classified_cleanup_secret'
    ) or not exists (
        select 1 from vault.decrypted_secrets
        where name = 'classified_cleanup_apikey'
    ) then
        raise exception 'Crea primero los secretos classified_cleanup_url, classified_cleanup_secret y classified_cleanup_apikey en Supabase Vault.';
    end if;
end;
$$;

select cron.unschedule(jobid)
  from cron.job
 where jobname = 'classified-cleanup-hourly';

select cron.schedule(
    'classified-cleanup-hourly',
    '15 * * * *',
    $job$
    select net.http_post(
        url := (
            select decrypted_secret
              from vault.decrypted_secrets
             where name = 'classified_cleanup_url'
        ) || '/functions/v1/classified-cleanup',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'apikey', (
                select decrypted_secret
                  from vault.decrypted_secrets
                 where name = 'classified_cleanup_apikey'
            ),
            'x-cron-secret', (
                select decrypted_secret
                  from vault.decrypted_secrets
                 where name = 'classified_cleanup_secret'
            )
        ),
        body := jsonb_build_object('source', 'pg_cron')
    );
    $job$
);

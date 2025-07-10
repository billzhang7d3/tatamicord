INSERT INTO member (
    username,
    login_info
) VALUES (
    'kiara',
    jsonb_build_object(
        'email', 'kiara@example.com',
        'pw_hash', crypt('phoenix', gen_salt('bf'))
    )
), (
    'noel',
    jsonb_build_object(
        'email', 'noel@example.com',
        'pw_hash', crypt('knight', gen_salt('bf'))
    )
), (
    'luna',
    jsonb_build_object(
        'email', 'luna@example.com',
        'pw_hash', crypt('princess', gen_salt('bf'))
    )
), (
    'bill',
    jsonb_build_object(
        'email', 'bill@example.com',
        'pw_hash', crypt('scientist', gen_salt('bf'))
    )
), (
    'ruby',
    jsonb_build_object(
        'email', 'ruby@example.com',
        'pw_hash', crypt('star', gen_salt('bf'))
    )
), (
    'ruby',
    jsonb_build_object(
        'email', 'ruby2@example.com',
        'pw_hash', crypt('star', gen_salt('bf'))
    )
), (
    'polka',
    jsonb_build_object(
        'email', 'polka@example.com',
        'pw_hash', crypt('performer', gen_salt('bf'))
    )
), (
    'choco',
    jsonb_build_object(
        'email', 'choco@example.com',
        'pw_hash', crypt('nurse', gen_salt('bf'))
    )
), (
    'dan',
    jsonb_build_object(
        'email', 'dan@example.com',
        'pw_hash', crypt('comedian', gen_salt('bf'))
    )
), (
    'cecilia',
    jsonb_build_object(
        'email', 'cecilia@example.com',
        'pw_hash', crypt('doll', gen_salt('bf'))
    )
), (
    'violet',
    jsonb_build_object(
        'email', 'violet@example.com',
        'pw_hash', crypt('transcriber', gen_salt('bf'))
    )
), (
    'dan',
    jsonb_build_object(
        'email', 'dan1@example.com',
        'pw_hash', crypt('composer', gen_salt('bf'))
    )
);
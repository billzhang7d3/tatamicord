-- create the view for selecting digits

CREATE VIEW digits AS
    SELECT '0' num
    UNION SELECT '1'
    UNION SELECT '2'
    UNION SELECT '3'
    UNION SELECT '4'
    UNION SELECT '5'
    UNION SELECT '6'
    UNION SELECT '7'
    UNION SELECT '8'
    UNION SELECT '9';

CREATE VIEW tag_list AS
    SELECT CONCAT(d1.num, d2.num, d3.num, d4.num) AS tag_
    FROM digits AS d1
    CROSS JOIN digits AS d2
    CROSS JOIN digits AS d3
    CROSS JOIN digits AS d4;

CREATE UNIQUE INDEX unique_email ON member(
    (login_info->>'email')
);

CREATE FUNCTION get_random_tag()
RETURNS TRIGGER AS
$BODY$
DECLARE
    tag_res CHAR(4);
BEGIN
    SELECT tag_ INTO tag_res
    FROM tag_list
    WHERE tag_ NOT IN (
        SELECT m.tag
        FROM member m 
        WHERE m.username = NEW.username
    )
    ORDER BY random()
    LIMIT 1;
    IF tag_res IS NULL THEN
        RAISE EXCEPTION 'all tags taken';
    END IF;
    NEW.tag = tag_res;
    RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

CREATE TRIGGER tag_generation
BEFORE INSERT
ON member
FOR EACH ROW
EXECUTE FUNCTION get_random_tag();

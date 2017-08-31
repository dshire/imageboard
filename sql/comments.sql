DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES images(id),
    author VARCHAR(255) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO comments (comment_id, author, comment) VALUES ('15', 'dav', 'nice!');
INSERT INTO comments (comment_id, author, comment) VALUES ('15', 'dav', 'best picture yet!');

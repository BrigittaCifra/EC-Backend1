INSERT INTO categories (name)
VALUES ('Electronics'),
    ('Furniture'),
    ('Clothing'),
    ('Sports'),
    ('Books');
INSERT INTO suppliers (
        name,
        contact_person_firstname,
        contact_person_secondname,
        email,
        phonenumber,
        country
    )
VALUES (
        'TechWorld AB',
        'Anna',
        'Karlsson',
        'anna@techworld.se',
        '0701234567',
        'Sweden'
    ),
    (
        'Nordic Furniture Co',
        'Johan',
        'Svensson',
        'johan@nordicfurniture.se',
        '0707654321',
        'Sweden'
    ),
    (
        'Sportify Supplies',
        'Maria',
        'Lopez',
        'maria@sportify.com',
        '0729988776',
        'Spain'
    ),
    (
        'BookSource Ltd',
        'Peter',
        'Nguyen',
        'peter@booksource.co.uk',
        '0731122334',
        'UK'
    ),
    (
        'ClothStream',
        'Sara',
        'Johansson',
        'sara@clothstream.se',
        '0768899001',
        'Sweden'
    );
INSERT INTO products (
        name,
        stock_quantity,
        price,
        category_id,
        supplier_id
    )
VALUES ('Smartphone X100', 15, 6999.00, 1, 1),
    ('Laptop Ultra 15', 8, 12999.00, 1, 1),
    ('Office Chair Deluxe', 25, 1299.00, 2, 2),
    ('Wooden Dining Table', 5, 3499.00, 2, 2),
    ('Running Shoes Pro', 40, 899.00, 4, 3),
    ('Basketball Leather', 60, 399.00, 4, 3),
    ('Classic Novel Set', 100, 299.00, 5, 4),
    ('Children Storybook', 75, 149.00, 5, 4),
    ('Winter Jacket Arctic', 30, 1299.00, 3, 5),
    ('Cotton T-Shirt Basic', 120, 79.00, 3, 5);
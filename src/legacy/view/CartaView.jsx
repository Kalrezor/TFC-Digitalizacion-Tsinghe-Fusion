import React from 'react';

const menuData = {
  alergenos: [
    { id: 1, nombre: "Cereales con gluten", imagen: "/assets/ico_cereales.png" },
    { id: 2, nombre: "Crustáceos", imagen: "/assets/ico_crustaceos.png" },
    { id: 3, nombre: "Huevos", imagen: "/assets/ico_huevos.png" },
    { id: 4, nombre: "Pescado", imagen: "/assets/ico_pescado.png" },
    { id: 5, nombre: "Cacahuetes", imagen: "/assets/ico_cacahuetes.png" },
    { id: 6, nombre: "Soja", imagen: "/assets/ico_soja.png" },
    { id: 7, nombre: "Lácteos", imagen: "/assets/ico_lacteos.png" },
    { id: 8, nombre: "Frutos secos", imagen: "/assets/ico_frutos_secos.png" },
    { id: 9, nombre: "Apio", imagen: "/assets/ico_apio.png" },
    { id: 10, nombre: "Mostaza", imagen: "/assets/ico_mostaza.png" },
    { id: 11, nombre: "Sésamo", imagen: "/assets/ico_sesamo.png" },
    { id: 12, nombre: "Sulfitos", imagen: "/assets/ico_sulfitos.png" },
    { id: 13, nombre: "Altramuz", imagen: "/assets/ico_altramuz.png" },
    { id: 14, nombre: "Moluscos", imagen: "/assets/ico_moluscos.png" }
  ],

  menu: [
    {
      categoria: "ENSALADAS",
      platos: [
        { nombre: "Ensalada de queso de cabra", descripcion: "Ensalada, tomate cherry, zanahoria, queso de cabra", precio: 8.50, alergenos: [7] },
        { nombre: "Ensalada de algas con sésamo", descripcion: "Algas, semilla de sésamo", precio: 8.50, alergenos: [11] },
        { nombre: "Ensalada de edamame", descripcion: "Edamame, chile", precio: 5.95, alergenos: [6] },
        { nombre: "Ensalada mixta", descripcion: "Lechuga, tomate, atún, gambas", precio: 7.95, alergenos: [4, 2] },
        { nombre: "Ensalada de pulpo", descripcion: "Pulpo, salsa de sésamo, lechuga", precio: 8.50, alergenos: [14, 11] },
        { nombre: "Ensalada de pepino con medusas", descripcion: "Medusas, pepino, salsa de sesamo, salsa de soja, vinagre", precio: 11.50, alergenos: [11, 6, 12] }
      ]
    },
    {
      categoria: "SOPAS",
      platos: [
        { nombre: "Sopa de miso", descripcion: "Tofu, algas y miso", precio: 4.95, alergenos: [6] },
        { nombre: "Sopa de aleta de tiburón", descripcion: "Fideos de patata, setas", precio: 6.50, alergenos: [] },
        { nombre: "Sopa agripicante", descripcion: "Huevo, pollo, pimiento rojo, pimiento verde", precio: 4.95, alergenos: [3] },
        { nombre: "Sopa de mariscos", descripcion: "Gambas, huevo y palito de cangrejo", precio: 6.50, alergenos: [2, 3, 4] },
        { nombre: "Sopa de udon", descripcion: "Fideos, huevo, verdura, gambas y setas", precio: 9.95, alergenos: [1, 3, 2] },
        { nombre: "Ramen de Tokio", descripcion: "Harina de trigo, huevo, verdura, setas, gambas, cebollino, cangrejo", precio: 9.50, alergenos: [1, 3, 2] }
      ]
    },
    {
      categoria: "ARROZES",
      platos: [
        { nombre: "Arroz frito qinghe", descripcion: "Pollo, gambas, ternera, verduras, salsa de soja, huevo", precio: 7.95, alergenos: [2, 6, 3] },
        { nombre: "Arroz frito tradicional", descripcion: "Arroz, jamón york, zanaoria, guisante, maíz, huevo", precio: 6.50, alergenos: [3] },
        { nombre: "Arroz frito con mariscos", descripcion: "Palito de cangrejo, calamares, gambas, guisantes, zanahoria, huevo maíz y arroz", precio: 7.95, alergenos: [2, 14, 3, 4] },
        { nombre: "Arroz con anguila", descripcion: "Arroz, vinagre, anguila, sésamo", precio: 10.50, alergenos: [4, 11] },
        { nombre: "Arroz blanco", descripcion: "Arroz", precio: 2.50, alergenos: [] }
      ]
    },
    {
      categoria: "FIDEOS Y TALLARINES",
      platos: [
        { nombre: "Pasta de arroz frito", descripcion: "Pasta de arroz, huevo, pollo, gambas y verduras", precio: 8.50, alergenos: [3, 2] },
        { nombre: "Udon salteado", descripcion: "Harina, gambas, huevo, verdura", precio: 9.95, alergenos: [1, 2, 3] },
        { nombre: "Ternera chow fun", descripcion: "Pasta de arroz, ternera, huevo y verduras", precio: 8.50, alergenos: [3] },
        { nombre: "Tallarines salteados con ternera", descripcion: "Tallarines, verdura, ternera, huevo", precio: 8.95, alergenos: [1, 3] },
        { nombre: "Tallarines salteados con pollo", descripcion: "Tallarines, pollo, verdura, huevo", precio: 8.75, alergenos: [1, 3] },
        { nombre: "Tallarines fritos con mariscos", descripcion: "Tallarines, gambas, verdura, cangrejo, huevo", precio: 8.95, alergenos: [1, 2, 3, 4] },
        { nombre: "Tallarines fritos con verduras", descripcion: "Tallarines, verduras, huevo", precio: 6.75, alergenos: [1, 3] },
        { nombre: "Fideos de arroz salteados qinghe", descripcion: "Fideos de arroz, gambas, ternera, brote de soja, huevo", precio: 8.95, alergenos: [2, 6, 3] },
        { nombre: "Fideos de arroz salteados con ternera", descripcion: "Fideos de arroz, ternera,brote de soja , huevo", precio: 8.95, alergenos: [3, 6] },
        { nombre: "Fideos de arroz salteados con pollo", descripcion: "Fideos de arroz, pollo, verdura, huevo", precio: 8.75, alergenos: [3] },
        { nombre: "Fideos de arroz, gambas, huevo y verduras", descripcion: "Fideos de arroz, gambas y verduras", precio: 8.95, alergenos: [2] }
      ]
    },
    {
      categoria: "DIM SUM",
      platos: [
        { nombre: "Empanadillas chinas 5 uds", descripcion: "Harina, verdura, carne", precio: 5.75, alergenos: [1] },
        { nombre: "Xiaolongbao de shanghai 4 uds", descripcion: "Carne de pollo, mantequilla de cerdo, levadura, almidón, azúcar", precio: 6.50, alergenos: [1] },
        { nombre: "Wonton frito", descripcion: "Cerdo, harina", precio: 6.50, alergenos: [1] },
        { nombre: "Pastel de calbaza", descripcion: "Calabaza, arroz glutinoso, harina, mantequilla, azúcar", precio: 6.50, alergenos: [1, 7] },
        { nombre: "Albondigas de gambas a la cantonesa 4 uds", descripcion: "Gambas crevette, poisson, huile de soja, mie de pain, farine tapioca", precio: 7.50, alergenos: [2, 4, 6, 1] },
        { nombre: "Empanadillas chinas de ternera e hígado de ganso", descripcion: "Ternera, harina, antioxidante, almidón de trigo", precio: 7.95, alergenos: [1] },
        { nombre: "Rollitos de primavera 6 uds", descripcion: "Pasta de harina, repollo, fideos, zanahoria, cebolla", precio: 5.50, alergenos: [1] },
        { nombre: "Rollitos vietnamitas de cerdo 6 uds", descripcion: "Harina, soja, carne, verdura", precio: 6.75, alergenos: [1, 6] },
        { nombre: "Rollitos vietnamitas de pollo 6 uds", descripcion: "Harina, soja, pollo, verdura", precio: 6.75, alergenos: [1, 6] },
        { nombre: "Siu mai cantonés 4 uds", descripcion: "Gambas, cerdo y harina", precio: 6.50, alergenos: [2, 1] },
        { nombre: "Baozi cristal mixto 5 uds", descripcion: "Gambas, cerdo, picante, seta, cangrejo, pollo", precio: 7.50, alergenos: [2, 1] },
        { nombre: "Gyozas fritas estilo kioto 6 uds", descripcion: "Harina, carne, verdura, apio", precio: 6.50, alergenos: [1, 9] },
        { nombre: "Xiaolongbao de cerdo 4 uds", descripcion: "Harina, carne, verdura", precio: 5.95, alergenos: [1] },
        { nombre: "Bolitas de sésamo 4 uds", descripcion: "Harina de arroz glutinoso, azúcar, patata, sésamo, huevo, pescado, soja, frutos de cáscara, apio, moluscos", precio: 5.95, alergenos: [1, 3, 4, 6, 8, 9, 11, 14] },
        { nombre: "Globo Real del Cangrejo 6 uds", descripcion: "Pesacdo, azúcar, huevo, harina, cangrejo, soja", precio: 5.95, alergenos: [4, 3, 1, 2, 6] },
        { nombre: "Pan chino", descripcion: "Harina", precio: 1.95, alergenos: [1] }
      ]
    },
    {
      categoria: "VERDURA",
      platos: [
        { nombre: "Tofu en salsa picante", descripcion: "Tofu, cebollito, carne de cerdo, salsa picante", precio: 8.20, alergenos: [6] },
        { nombre: "Berenjena con salsa yuxiang", descripcion: "Cerdo, berenjena, soja, vinagre", precio: 9.50, alergenos: [6] },
        { nombre: "Verduras mixtas salteadas", descripcion: "Verduras, zanahorias, champiñones y hongos, setas", precio: 9.50, alergenos: [] },
        { nombre: "Guoba tres delicias", descripcion: "Gambas, arroz, pollo, ternera, calabacín, zanahoria, cebolla", precio: 11.50, alergenos: [2] }
      ]
    },
    {
      categoria: "TERNERA",
      platos: [
        { nombre: "Ternera con setas y bambú", descripcion: "Ternera setas y bambú", precio: 11.95, alergenos: [] },
        { nombre: "Ternera con salsa de ostras", descripcion: "Ternera, salsa de ostras y verduras", precio: 11.95, alergenos: [14] },
        { nombre: "Tenera con patatas fritas", descripcion: "Ternera y patatas fritas", precio: 11.50, alergenos: [] },
        { nombre: "Ternera con verduras mixtas salteadas", descripcion: "Ternera, calabazín, zanahoria, cebolleta, pimiento verde", precio: 11.50, alergenos: [] },
        { nombre: "Ternera a la plancha", descripcion: "Ternera", precio: 12.50, alergenos: [] },
        { nombre: "Ternera con sabor a comino", descripcion: "Ternera con sabor a comino", precio: 12.50, alergenos: [] },
        { nombre: "Ternera teriyaki", descripcion: "Ternera, salsa soja, almidón", precio: 12.50, alergenos: [6] }
      ]
    },
    {
      categoria: "POLLO",
      platos: [
        { nombre: "Pollo king pao", descripcion: "Pollo, verduras y chile, cacahuetes", precio: 10.95, alergenos: [5] },
        { nombre: "Alitas de pollo fritas al estilo japonés", descripcion: "Alitas de pollo y harina, sésamo", precio: 13.50, alergenos: [1, 11] },
        { nombre: "Pollo con almendras", descripcion: "Pollo, verdura y almendra", precio: 10.50, alergenos: [8] },
        { nombre: "Tiras de pollo con salsa agridulce", descripcion: "Pollo, sésamo, vinagre, azúcar", precio: 11.95, alergenos: [11] },
        { nombre: "Pollo con chiles picantes", descripcion: "Pollo y chile, salsa soja", precio: 10.95, alergenos: [6] },
        { nombre: "Pollo al limón", descripcion: "Harina, pollo, limón, vinagre, azúcar", precio: 11.50, alergenos: [1] },
        { nombre: "Pollo almendrado frito", descripcion: "Pollo, almendra, huevo, harina", precio: 12.95, alergenos: [1, 3, 8] },
        { nombre: "Pollo al curry", descripcion: "Pollo, curry, pimiento, cebolla", precio: 10.95, alergenos: [] },
        { nombre: "Brochetas de pollo a la parrilla estilo japonés 4 uds", descripcion: "Pollo, soja, harina", precio: 7.95, alergenos: [1, 6] },
        { nombre: "Pollo empanado japonés con queso", descripcion: "Pollo harina, cacahuetes, sésamo", precio: 12.95, alergenos: [1, 5, 7, 11] },
        { nombre: "Pollo salteado con champiñones", descripcion: "Pollo, champiñones, cebolla, soja", precio: 10.50, alergenos: [6] },
        { nombre: "Tiras de pollo triyaki", descripcion: "Pollo, soja, almidón", precio: 11.95, alergenos: [6] }
      ]
    },
    {
      categoria: "PATO",
      platos: [
        { nombre: "Pato a la naranja", descripcion: "Pato, zumo de naranja, azúcar", precio: 14.95, alergenos: [] },
        { nombre: "Pato con setas y bambú", descripcion: "Setas, bambú, pato, salsa soja, salsa ostra", precio: 14.95, alergenos: [6, 14] },
        { nombre: "Rollitos de pato", descripcion: "Harina, pato, puerro, pepino, salsa teriyaki", precio: 8.50, alergenos: [1, 6] },
        { nombre: "Pato laqueado de pekin medio", descripcion: "Salsa de soja, pato, pepino, cebollito, harina", precio: 21.95, alergenos: [1, 6] }
      ]
    },
    {
      categoria: "CERDO",
      platos: [
        { nombre: "Costillas de cerdo en salsa agridulce", descripcion: "Sésamo, salsa de soja, vinagre, azúcar,vino", precio: 12.00, alergenos: [6, 11] },
        { nombre: "Carne de cerdo salteado con salsa agridulce", descripcion: "Cerdo, maízena, salsa agridulce, vinagre, azúcar", precio: 11.50, alergenos: [] },
        { nombre: "Tiritas de carne de cerdo salteadas en salsa de ajo picante", descripcion: "Cerdo, pimientos rojos y verdes, hongos y zanahoria", precio: 11.00, alergenos: [] },
        { nombre: "Orejas de cerdo salteadas con verduras mixtas", descripcion: "Oreja de cerdo y verduras", precio: 12.00, alergenos: [] },
        { nombre: "Cerdo agridulce", descripcion: "Cerdo, vinagre, harina, azúcar", precio: 10.50, alergenos: [1] },
        { nombre: "Cerdo asado y condimentado a la cantonésa", descripcion: "Cerdo asado, condimento de la cantonésa", precio: 15.95, alergenos: [] }
      ]
    },
    {
      categoria: "MARISCO",
      platos: [
        { nombre: "Albondigas de gambas al wasabi", descripcion: "Gambas, wasabi, harina, tofu", precio: 14.00, alergenos: [1, 2, 6] },
        { nombre: "Calamar picante", descripcion: "Calamar y chile", precio: 14.50, alergenos: [14] },
        { nombre: "Langostinos salteados con verduras mixtas", descripcion: "Gambas, pimiento rojo y verde, cebolla picante", precio: 12.50, alergenos: [2] },
        { nombre: "Langostinos fritos", descripcion: "Langostinos, harina, almidón, aceite de palma, azúcar, sal, levadura", precio: 13.95, alergenos: [1, 2] },
        { nombre: "Guoba con gambas", descripcion: "Gambas, cebolla, zanahoria, calabacín", precio: 12.50, alergenos: [2] },
        { nombre: "Langostinos al ajillo", descripcion: "Gambas, ajo, pimiento rojo y verde, cebolla picante", precio: 15.00, alergenos: [2] },
        { nombre: "Calamares a la plancha", descripcion: "Calamar, verura y mantequilla", precio: 14.95, alergenos: [7, 14] }
      ]
    },
    {
      categoria: "NIGIRIS",
      platos: [
        { nombre: "Nigiri salmón con cheddar 2 uds", descripcion: "arroz, vinagre, mayonesa, sésamo, queso cheddar", precio: 6.95, alergenos: [3, 4, 7, 11] },
        { nombre: "Nigiri salmón 2 uds", descripcion: "Salmón, arroz, vinagre, azúcar", precio: 4.85, alergenos: [4] },
        { nombre: "Nigiri atún 2 uds", descripcion: "Atún, arroz, vinagre, azúcar", precio: 5.75, alergenos: [4] },
        { nombre: "Nigiri pez mantequilla 2 uds", descripcion: "Pez mantequilla, arroz, vinagre, azúcar", precio: 5.50, alergenos: [4] },
        { nombre: "Nigiri lubina 2 uds", descripcion: "Lubina, arroz, vinagre, azúcar", precio: 5.35, alergenos: [4] },
        { nombre: "Nigiri langostinos 2 uds", descripcion: "Langostinos, arroz, vinagre, azúcar", precio: 4.55, alergenos: [2] },
        { nombre: "Nigiri salmón flambeado 2 uds", descripcion: "Salmón, arroz, vinagre, azúcar", precio: 5.50, alergenos: [4] },
        { nombre: "Nigiri salmón con aguacate 2 uds", descripcion: "Salmón, aguacate, arroz, vinagre, azúcar", precio: 4.95, alergenos: [4] },
        { nombre: "Nigiri pulpo 2 uds", descripcion: "Pulpo, aguacate, arroz, vinagre, azúcar", precio: 5.50, alergenos: [14] },
        { nombre: "Nigiri anguila 2 uds", descripcion: "Anguila con salsa de soja, arroz, vinagre, azúcar", precio: 5.50, alergenos: [4, 6] }
      ]
    },
    {
      categoria: "GUNKAN",
      platos: [
        { nombre: "Gunkan tobiko 2 uds", descripcion: "Alga nori, arroz, tobiko, vinagre", precio: 5.70, alergenos: [4] },
        { nombre: "Gunkan wakame 2 uds", descripcion: "Alga nori, arroz, wakame, vinagre", precio: 5.50, alergenos: [] },
        { nombre: "Gunkan de salmón y queso 2 uds", descripcion: "Arroz, vinagre, salmón, queso", precio: 5.95, alergenos: [4, 7] },
        { nombre: "Gunkan de salmón flambeado 2 uds", descripcion: "Arroz, vinagre, salmón, queso, salsa de anguila", precio: 6.35, alergenos: [4, 7] }
      ]
    },
    {
      categoria: "MAKI",
      platos: [
        { nombre: "Maki salmón 8 uds", descripcion: "Salmón, alga nori, arroz, vinagre, azúcar", precio: 5.70, alergenos: [4] },
        { nombre: "Maki atún 8 uds", descripcion: "Atún, alga nori, arroz, vinagre, azúcar", precio: 6.95, alergenos: [4] },
        { nombre: "Maki cangrejo y mayonesa 8 uds", descripcion: "Palito de cangrejo, alga nori, arroz, vinagre, azúcar", precio: 5.25, alergenos: [2, 3] },
        { nombre: "Maki pez mantequilla 8 uds", descripcion: "Pez mantequilla, alga nori, arroz, vinagre, azúcar", precio: 5.75, alergenos: [4] },
        { nombre: "Maki aguacate 8 uds", descripcion: "Aguacate, alga nori, arroz, vinagre, azúcar", precio: 4.75, alergenos: [] },
        { nombre: "Maki pepino 8 uds", descripcion: "Pepino, alga nori, arroz, vinagre, azúcar", precio: 4.75, alergenos: [] },
        { nombre: "Futomaki 12 uds", descripcion: "Salmón, pez mantequilla, atún, langostino, cangrejo, pepino, harina", precio: 14.95, alergenos: [1, 2, 4] },
        { nombre: "Maki aguacate con salmón 8 uds", descripcion: "Salmón, alga nori, aguacate, arroz, vinagre, azúcar", precio: 5.75, alergenos: [4] },
        { nombre: "Maki salmón queso crema 8 uds", descripcion: "Salmón, alga nori, queso cremoso, arroz, vinagre, azúcar", precio: 5.95, alergenos: [4, 7] },
        { nombre: "Maki salmón frito 8 uds", descripcion: "Salmón, alga nori, arroz, vinagre, azúcar, harina, mayonesa", precio: 6.70, alergenos: [1, 3, 4] },
        { nombre: "Maki Pollo frito 8 uds", descripcion: "Pollo, alga nori, arroz, vinagre, harina", precio: 5.50, alergenos: [1] },
        { nombre: "Maki de langostinos en tempura 8 uds", descripcion: "Langostino, alga nori, arroz, vinagre, harina", precio: 6.50, alergenos: [1, 2] }
      ]
    },
    {
      categoria: "ROLL",
      platos: [
        { nombre: "Roll salmón y aguacate 8 uds", descripcion: "Slmón, alga nori, aguacate, arroz, vinagre, azúcar", precio: 9.95, alergenos: [4] },
        { nombre: "Roll salmón y aguacate con salsa de anguila y mayonesa cubierto de cebolla frita", descripcion: "Salsa soja, mayonesa, salmón, aguacate, anguila, cebolla", precio: 10.95, alergenos: [3, 4, 6] },
        { nombre: "Roll atún y aguacate 8 uds", descripcion: "Atún, alga nori, aguacate, arroz, vinagre, azúcar", precio: 11.95, alergenos: [4] },
        { nombre: "Roll atún, salmón y aguacate", descripcion: "Atún, salmón, aguacate, arroz", precio: 10.95, alergenos: [4] },
        { nombre: "Roll salmón y aguacate con sésamo blanco y negro 8 uds", descripcion: "Salmón, alga nori, aguacate, arroz, vinagre, azúcar, sésamo blanco y negro", precio: 9.95, alergenos: [4, 11] },
        { nombre: "Roll cebolla y aguacate con sésamo blanco y negro 8 uds", descripcion: "Cebolla y aguacate con sésamo blanco y negro, alga nori, arroz, vinagre, azúcar", precio: 9.50, alergenos: [11] },
        { nombre: "Roll langostinos fritos con queso, salmón y aguacate 8 uds", descripcion: "Langostinos fritos con queso, salmón, alga nori, aguacate, arroz, vinagre, azúcar", precio: 12.50, alergenos: [1, 2, 4, 7] },
        { nombre: "Roll langostinos fritos con aguacate y sésamo blanco y negro picante 8 uds", descripcion: "Langostinos fritos con aguacate y sésamo blanco y negro, chile, alga nori, arroz, vinagre, azúcar", precio: 10.95, alergenos: [1, 2, 11] },
        { nombre: "Roll langostinos fritos con aguacate y sésamo blanco y negro 8 uds", descripcion: "Langostinos fritos con aguacate y sésamo blanco y negro, alga nori, arroz, vinagre, azúcar", precio: 10.95, alergenos: [1, 2, 11] },
        { nombre: "Roll nuggets de pollo frito con sésamo blanco y negro 8 uds", descripcion: "Pollo frito con sésamo blanco y negro, alga nori, arroz, vinagre, azúcar", precio: 9.95, alergenos: [1, 11] },
        { nombre: "Roll cangrejo y langostino con aguacate cubierto de huevas 8 uds", descripcion: "Palito de cangrejo, langostino, aguacate, huevas de pescado, alga nori, arroz, vinagre, azúcar", precio: 9.95, alergenos: [2, 4] },
        { nombre: "Roll atún salmón pez mantequilla aguacate cubierto de algas 8 uds", descripcion: "Mayonesa, sésamo, pescado, arroz", precio: 10.95, alergenos: [3, 4, 11] },
        { nombre: "Roll salmón y aguacate con queso cubierto de sésamo blanco 8 uds", descripcion: "Salmón, alga nori, queso, aguacate, arroz, vinagre, azúcar, sésamo blanco", precio: 9.95, alergenos: [4, 7, 11] },
        { nombre: "Roll salmón con aguacate cubierto de huevas 8 uds", descripcion: "Salmón, alga nori, aguacate, huevas de pescado, arroz, vinagre, azúcar", precio: 9.95, alergenos: [4] },
        { nombre: "Roll salmón picado cubierto con sésamo blanco y negro 8 uds", descripcion: "Salmón, alga nori, harina, sésamo blanco y negro, arroz, vinagre, azúcar", precio: 10.50, alergenos: [1, 4, 11] },
        { nombre: "Roll atún y aguacate con sésamo blanco y negro 8 uds", descripcion: "Atún, alga nori, harina, sésamo blanco y negro, arroz, vinagre, azúcar", precio: 11.50, alergenos: [1, 4, 11] },
        { nombre: "Roll pollo frito 8 uds", descripcion: "Arroz, vinagre, pollo, harina,sésamo, aguacate, alga nori", precio: 10.95, alergenos: [1, 11] },
        { nombre: "Roll salmón y aguacate frito 8 uds", descripcion: "Alga nori, arroz, vinagre, salmón, aguacate, harina, salsa de anguila, salsa mayonesa", precio: 12.95, alergenos: [1, 3, 4] },
        { nombre: "Roll cheddar California 8 uds", descripcion: "Alga nori, arroz, vinagre, langostinos, cangrejo, aguacate, queso cheddar, salsa de anguila", precio: 10.95, alergenos: [2, 7] },
        { nombre: "Roll cheddar salmón 8 uds", descripcion: "Alga nori, arroz, salmón, aguacate, queso cheddar, salsa de anguila", precio: 12.95, alergenos: [4, 7] },
        { nombre: "Roll soasado de dragón salmón 8 uds", descripcion: "Alga nori, arroz, vinagre, langostinos fritos, aguacate, salmón, salsa japonesa, salsa de anguila", precio: 12.50, alergenos: [1, 2, 4] },
        { nombre: "Roll soasado dragón pez mantequilla 8 uds", descripcion: "Alga nori, arroz, vinagre, pez mantequilla, aguacate, langostino frito, salsa de anguila", precio: 12.95, alergenos: [1, 2, 4] },
        { nombre: "Roll samón picante 8 uds", descripcion: "Alga nori, arroz, vinagre, aguacate, salmón, salsa picante, salsa mayonesa", precio: 10.50, alergenos: [3, 4] },
        { nombre: "Roll California picante 8 uds", descripcion: "Algas, nori, vinagre, aguacate, cangrejo, langostino, salsa picante", precio: 9.50, alergenos: [2, 4] },
        { nombre: "Roll pez mantequilla uramaki 8 uds", descripcion: "Alga nori, arroz, vinagre, pez mantequilla, salsa trufa", precio: 10.95, alergenos: [4] },
        { nombre: "Roll soasado salmón 8 uds", descripcion: "Alga nori, arroz, vinagre, salmón, aguacate, salsa mayonesa, salsa de anguila", precio: 12.95, alergenos: [3, 4] },
        { nombre: "Roll dragón atún 8 uds", descripcion: "Alga nori, arroz, vinagre, langostinos fritos, salsa mayonesa, salsa de anguila", precio: 13.95, alergenos: [1, 2, 3, 4] },
        { nombre: "Roll Japan aguacate", descripcion: "Alga nori, arroz, vinagre, aguacate, queso, pepino", precio: 9.50, alergenos: [7] }
      ]
    },
    {
      categoria: "TEMAKI",
      platos: [
        { nombre: "Temaki salmón 1 ud", descripcion: "Salmón, alga nori, arroz, vinagre, azúcar", precio: 5.75, alergenos: [4] },
        { nombre: "Temaki atún 1 ud", descripcion: "Atún, alga nori, arroz, vinagre, azúcar", precio: 6.75, alergenos: [4] },
        { nombre: "Temaki pez mantequilla 1 ud", descripcion: "Pez mantequilla, alga nori, arroz, vinagre, azúcar", precio: 5.95, alergenos: [4] },
        { nombre: "Temaki angila 1 ud", descripcion: "Angila, alga nori, arroz, vinagre, azúcar", precio: 5.95, alergenos: [4] },
        { nombre: "Temaki langostinos 1 ud", descripcion: "Langostinos, alga nori, arroz", precio: 5.75, alergenos: [2] },
        { nombre: "Temaki aguacate 1 ud", descripcion: "Aguacate, alga nori, arroz", precio: 4.75, alergenos: [] }
      ]
    },
    {
      categoria: "SASHIMI",
      platos: [
        { nombre: "Sashimi salmón 8 uds", descripcion: "Salmón, alga nori, arroz, vinagre, azúcar", precio: 15.95, alergenos: [4] },
        { nombre: "Sashimi atún 8 uds", descripcion: "Atún, alga nori, arroz, vinagre, azúcar", precio: 19.95, alergenos: [4] },
        { nombre: "Sashimi pez mantequilla 8 uds", descripcion: "Pez mantequilla, alga nori, arroz, vinagre, azúcar", precio: 15.95, alergenos: [4] },
        { nombre: "Sashimi lubina 8 uds", descripcion: "Lubina, alga nori, arroz, vinagre, azúcar", precio: 15.95, alergenos: [4] },
        { nombre: "Sashimi salmón, atún y pez mantequilla 12 uds", descripcion: "Salmón, atún, pez mantequilla", precio: 23.95, alergenos: [4] },
        { nombre: "Sashimi salmón, atún, pez mantequilla y lubina 16 uds", descripcion: "Salmón, atún, pez mantequilla, lubina", precio: 25.95, alergenos: [4] }
      ]
    },
    {
      categoria: "TATAKI",
      platos: [
        { nombre: "Tataki salmón 8 uds", descripcion: "Salmón, salsa de soja", precio: 15.95, alergenos: [4, 6] },
        { nombre: "Tataki atún 8 uds", descripcion: "Atún, salsa de soja", precio: 19.95, alergenos: [4, 6] }
      ]
    },
    {
      categoria: "TARTAR",
      platos: [
        { nombre: "Tartar salmón", descripcion: "Salmón, aguacate, sésamo, algas, tobiko", precio: 14.95, alergenos: [4, 11] },
        { nombre: "Tartar atún", descripcion: "Atún, aguacate, algas, tobiko, sésamo", precio: 17.95, alergenos: [4, 11] },
        { nombre: "Tartar pez mantequilla", descripcion: "Pez mantequilla, aguacate, algas, tobiko, sésamo", precio: 15.95, alergenos: [4, 11] },
        { nombre: "Tartar salmón trufa", descripcion: "Salmón, aguacate, algas, tobiko, trufa, sésamo", precio: 15.95, alergenos: [4, 11] }
      ]
    },
    {
      categoria: "POKE",
      platos: [
        { nombre: "Poke pollo", descripcion: "Arroz, vinagre, aguacate, cebolla frita, maíz, algas, tomate cherry, pollo, harina, salsa de anguila, sésamo", precio: 13.95, alergenos: [1, 11] },
        { nombre: "Poke atún", descripcion: "Arroz, vinagre, aguacate, cebolla frita, maíz, algas, tomate cherry, atún, salsa de anguila, sésamo", precio: 14.95, alergenos: [4, 11] },
        { nombre: "Poke salmón", descripcion: "Arroz, vinagre, aguacate, cebolla frita, maíz, algas, tomate cherry, salmón, salsa de anguila, sésamo", precio: 14.45, alergenos: [4, 11] },
        { nombre: "Poke pez mantequilla", descripcion: "Arroz, vinagre, aguacate, cebolla frita, maíz, algas, tomate cherry, pez mantequilla, sésamo", precio: 14.95, alergenos: [4, 11] }
      ]
    },
    {
      categoria: "BANDEJAS",
      platos: [
        { nombre: "Maki de atún y salmón, roll de atún y salmón 24 uds", descripcion: "Salmón, atún, alga nori, arroz, vinagre, azúcar", precio: 25.75, alergenos: [4] },
        { nombre: "Nigiri de salmón, maki de salmón 16 uds", descripcion: "Salmón, arroz, vinagre, azúcar", precio: 20.95, alergenos: [4] },
        { nombre: "Nigiri de atún y maki de atún 16 uds", descripcion: "Atún, arroz, vinagre, azúcar", precio: 24.95, alergenos: [4] },
        { nombre: "Maki de atún y nigiri de atún y anguila 16 uds", descripcion: "Atún y anguila, arroz, vinagre, azúcar", precio: 22.95, alergenos: [4] },
        { nombre: "Plato combinado atún y salmón 16 uds", descripcion: "Atún, arroz, vinagre, azúcar, salmón", precio: 22.95, alergenos: [4] },
        { nombre: "Plato combinado nigiri salmón y anguila, maki salmón y atún 16 uds", descripcion: "Atún, salmón, arroz, vinagre, azúcar", precio: 22.95, alergenos: [4, 6] },
        { nombre: "Plato 20 uds = 8 Roll salmón, 8 Maki salmón, 2 Nigiri salmón y 2 Sashimi salmón", descripcion: "Alga nori, arroz, vinagre, salmón, aguacate", precio: 25.50, alergenos: [4] },
        { nombre: "Plato 20 uds = 8 Roll atún, 8 Maki atún, 2 Nigiri atún y 2 Sashimi atún", descripcion: "Alga nori, arroz, vinagre, atún, aguacate", precio: 26.95, alergenos: [4] },
        { nombre: "Plato 18 uds = 4 Roll tobiko, 4 Roll California, 4 Maki salmón, 2 Nigiri salmón, 1 Nigiri pez mantequilla, 1 Nigiri atún, 1 Nigiri langostinos, 1 Nigiri anguila", descripcion: "Alga nori, arroz, vinagre, tobiko, salmón, atún, pez mantequilla, langostinos, anguila, aguacate", precio: 24.95, alergenos: [4, 2] },
        { nombre: "Plato 16 uds = 8 Roll Japan Arcoíris, 2 Nigiri salmón, 2 Nigiri atún, 2 Nigiri pez mantequilla, 2 Nigiri langostino", descripcion: "Alga nori, arroz, vinagre, salmón, atún, pez mantequilla, langostinos, aguacate", precio: 23.95, alergenos: [4, 2] },
        { nombre: "Plato 24 uds = 8 Roll Japan, 8 maki aguacate, 8 maki pepino", descripcion: "Alga nori, arroz, vinagre, aguacate", precio: 15.95, alergenos: [] },
        { nombre: "Plato 20 uds = 8 Roll California con cebolla, 4 maki atún, 4 maki salmón, 2 nigiri atún, 2 nigiri salmón", descripcion: "Alga nori, arroz, vinagre, cebolla, salmón, atún, aguacate", precio: 25.95, alergenos: [4] },
        { nombre: "Plato 20 uds = 8 Roll California, 4 maki atún, 4 maki salmón, 1 nigiri atún, 1 nigiri salmón, 1 nigiri langostino, 1 nigiri lubina", descripcion: "Alga nori, arroz, vinagre, aguacate, atún, salmón, langostinos, lubina, sésamo", precio: 23.95, alergenos: [4, 2, 11] },
        { nombre: "Plato 16 uds = 4 Roll California picante, 4 Roll California con cebolla, 2 nigiri atún, 2 nigiri salmón, 2 nigiri pez mantequilla, 2 nigiri lubina", descripcion: "Alga nori, arroz, vinagre, aguacate, cebolla, atún, salmón, pez mantequilla, lubina, salsa de mayonesa", precio: 27.50, alergenos: [4, 3] },
        { nombre: "Plato 20 uds = 8 Roll California pollo, 8 Roll California tobiko, 2 nigiri atún, 2 nigiri salmón", descripcion: "Alga nori, arroz, vinagre, aguacate, pollo, atún, salmón, sésamo, tobiko", precio: 27.95, alergenos: [4, 11, 1] },
        { nombre: "Plato 16 uds = 4 maki atún, 4 maki salmón, 2 nigiri atún, 2 nigiri salmón, 2 nigiri pez mantequilla, 2 nigiri langostino", descripcion: "Alga nori, arroz, vinagre, salmón, atún, pez mantequilla, langostino", precio: 20.95, alergenos: [4, 2] },
        { nombre: "Plato 20 uds = 8 Roll salmón, 4 Roll atún picante, 4 Roll salmón picante, 2 nigiri salmón, 2 sashimi salmón", descripcion: "Alga nori, arroz, vinagre, salmón, atún, salsa picante, sésamo, salsa de mayonesa, algas, aguacate", precio: 27.95, alergenos: [4, 11, 3] },
        { nombre: "Plato 16 uds = 8 Roll soasado dragón, 4 Gunkan salmón soasado flambeado, 2 nigiri salmón soasado flambeado, 2 sashimi salmón soasado", descripcion: "Alga nori, arroz, vinagre, salmón, aguacate, salsa de anguila", precio: 28.95, alergenos: [4] }
      ]
    },
    {
      categoria: "POSTRES",
      platos: [
        { nombre: "Helado Haagen-Dazs", precio: 4.00, alergenos: [7] },
        { nombre: "Mochi Fresa / Matcha / Caramelo Almendra / Chocolate / Cocopiña", descripcion: "Azúcar, fresa, soja, aceite de palma, almidón, colorante", precio: 4.00, alergenos: [6, 8] },
        { nombre: "Macedonia de Frutas", precio: 2.95, alergenos: [] },
        { nombre: "Flan", precio: 2.50, alergenos: [3, 7] },
        { nombre: "Plátano Frito (caramelo o miel)", precio: 3.50, alergenos: [1] },
        { nombre: "Plátano flambeado", precio: 4.50, alergenos: [] },
        { nombre: "Tarta de Queso", precio: 4.00, alergenos: [1, 3, 7] },
        { nombre: "Tarta 3 chocolates", precio: 4.50, alergenos: [1, 3, 7] },
        { nombre: "Coulant con helado", precio: 4.95, alergenos: [1, 3, 7] },
        { nombre: "Trufa japonesa con nata", precio: 4.50, alergenos: [7] }
      ]
    },
    {
      categoria: "CAFÉS Y TÉS",
      platos: [
        { nombre: "Café solo o con leche", precio: 2.00, alergenos: [7] },
        { nombre: "Café bombom", precio: 2.50, alergenos: [7] },
        { nombre: "Infusiones", precio: 2.00, alergenos: [] },
        { nombre: "Té chino", precio: 3.50, alergenos: [] }
      ]
    },
    {
      categoria: "BEBIDAS",
      platos: [
        { nombre: "Agua Solán 1L", precio: 3.30, alergenos: [] },
        { nombre: "Agua Solán 1/2L", precio: 2.20, alergenos: [] },
        { nombre: "Refrescos", precio: 3.30, alergenos: [] },
        { nombre: "Cerveza tercio", precio: 3.30, alergenos: [1] },
        { nombre: "Cerveza de copa", precio: 3.30, alergenos: [1] },
        { nombre: "Zumo", precio: 3.00, alergenos: [] },
        { nombre: "Aperol Spritz", descripcion: "Gaseosa, Aperal y prosecco", precio: 6.50, alergenos: [12] },
        { nombre: "Mojito", descripcion: "Menta, lima, ron, azúcar, agua con gas", precio: 7.50, alergenos: [] },
        { nombre: "Copa tinto de verano", precio: 3.50, alergenos: [12] },
        { nombre: "Jarra de sangria", precio: 10.95, alergenos: [12] }
      ]
    },
    {
      categoria: "VINOS",
      platos: [
        { nombre: "Vino tinto Rioja Crianza 75cl", precio: 15.50, alergenos: [12] },
        { nombre: "Vino tinto Ribera Protos 75cl", precio: 16.95, alergenos: [12] },
        { nombre: "Cune Blanco Rueda 75cl", precio: 13.95, alergenos: [12] },
        { nombre: "Vino Blanco diamante 75cl", precio: 13.95, alergenos: [12] },
        { nombre: "Vino Mateus Rose 75cl", precio: 13.50, alergenos: [12] },
        { nombre: "Vino Peñiascal Rosado 75cl", precio: 12.50, alergenos: [12] },
        { nombre: "Freixenet semiseco 75cl", precio: 14.50, alergenos: [12] },
        { nombre: "Freixenet brut 75cl", precio: 14.50, alergenos: [12] },
        { nombre: "Albariño 75cl", precio: 16.95, alergenos: [12] },
        { nombre: "Godello 75cl", precio: 17.95, alergenos: [12] }
      ]
    }
  ]
};

const ImagenAlergeno = ({ idAlergeno }) => {
  const infoAlergeno = menuData.alergenos.find(a => a.id === idAlergeno);
  
  if (!infoAlergeno) return null;

  return (
    <img 
      src={infoAlergeno.imagen}
      alt={infoAlergeno.nombre}
      title={infoAlergeno.nombre}
      className="me-1 border rounded"
      style={{ 
        width: '2rem',
        height: '2rem', 
        objectFit: 'contain',
        backgroundColor: '#fff',
        padding: '2px'
      }}
    />
  );
};

export default function CartaView() {
  return (
    <div className="container py-5 px-3" style={{ maxWidth: '900px' }}>
      {/* Encabezado */}
      <header className="text-center mb-5">
        <h2 className="display-5 fw-bold text-dark text-uppercase" style={{ letterSpacing: '0.15em' }}>
          Nuestra Carta
        </h2>
        <p className="text-secondary fst-italic">Qinghe Cocina Fusión - El Cañaveral</p>
      </header>

      <div className="d-flex flex-column gap-5">
        {menuData.menu.map((seccion, idx) => (
          <section key={idx}>
            <h3 className="h4 fw-bold pb-2 mb-4 text-uppercase" 
                style={{ 
                  color: '#b45309',
                  borderBottom: '2px solid #f59e0b'
                }}>
              {seccion.categoria}
            </h3>

            <div className="row g-4">
              {seccion.platos.map((plato, pIdx) => (
                <div key={pIdx} className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-start h-100 border-0">
                    <div className="pe-3 flex-grow-1">
                      <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>
                        {plato.nombre}
                      </h5>
                      {plato.descripcion && (
                        <p className="text-muted mb-1 small" style={{ lineHeight: '1.2' }}>
                          {plato.descripcion}
                        </p>
                      )}
                      
                      {plato.alergenos && plato.alergenos.length > 0 && (
                        <div className="d-flex flex-wrap mt-2">
                          {plato.alergenos.map(id => (
                            <ImagenAlergeno key={id} idAlergeno={id} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <span className="fw-bold text-dark px-2 py-1 rounded" 
                          style={{ backgroundColor: '#f3f4f6', minWidth: 'fit-content' }}>
                      {typeof plato.precio === 'number' ? `${plato.precio.toFixed(2)}€` : plato.precio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-5 p-4 rounded-3 border" 
              style={{ 
                backgroundColor: '#fffbeb',
                borderColor: '#fde68a',
                color: '#374151'
              }}>
        <p className="fw-bold mb-3 h5 text-dark">Información sobre alérgenos:</p>

        <p className="small mb-0 mt-4 fst-italic">
          Si usted tiene alguna alergia alimentaria, por favor póngase en contacto con nuestro personal. 
          Debido a nuestra elaboración artesanal, todos los platos pueden contener trazas de alérgenos.
        </p>
        
        <div className="row g-3">
          {menuData.alergenos.map(alergeno => (
            <div key={alergeno.id} className="col-12 col-sm-6 col-md-4 d-flex align-items-center">
              <img 
                src={alergeno.imagen}
                alt={alergeno.nombre}
                className="me-2 border rounded"
                style={{ 
                  width: '3rem',
                  height: '3rem', 
                  objectFit: 'contain', 
                  backgroundColor: '#fff', 
                  padding: '4px' 
                }}
              />
              <span className="text-muted small">{alergeno.nombre}</span>
            </div>
          ))}
        </div>
      
      </footer>
    </div>
  );
}
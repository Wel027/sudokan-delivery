const MENU = {
  categories: ['Combinados', 'Especialidades', 'Peças Individuais', 'Bebidas', 'Sobremesas'],
  products: [
    {
      id: 'comb-24', cat: 'Combinados', name: 'Combinado Sudokan 24 peças', price: 18.90,
      desc: 'Seleção do chef: maki, uramaki, nigiri e gunkan.', img: '', tags: ['Mais pedido'],
      removable: ['Pepino', 'Abacate', 'Cebolinha', 'Sésamo'],
      extras: [
        { name: 'Molho teriyaki', price: 0.50 },
        { name: 'Molho picante', price: 0.50 },
        { name: 'Gengibre extra', price: 0.50 },
      ],
    },
    {
      id: 'comb-16', cat: 'Combinados', name: 'Combinado Salmão 16 peças', price: 13.50,
      desc: 'Salmão fresco, philadelphia e maki de pepino.', img: '', tags: [],
      removable: ['Cream cheese', 'Pepino', 'Sésamo'],
      extras: [{ name: 'Molho teriyaki', price: 0.50 }],
    },
    {
      id: 'esp-hot', cat: 'Especialidades', name: 'Hot Roll Camarão', price: 9.50,
      desc: 'Camarão panado, cream cheese e molho picante.', img: '', tags: ['Novo'],
      removable: ['Molho picante', 'Cebolinha'],
      extras: [{ name: 'Molho teriyaki', price: 0.50 }],
    },
    {
      id: 'esp-uram', cat: 'Especialidades', name: 'Uramaki Philadelphia', price: 8.90,
      desc: 'Salmão, cream cheese e pepino com arroz por fora.', img: '', tags: [],
      removable: ['Pepino', 'Cebolinha', 'Sésamo'],
      extras: [{ name: 'Molho picante', price: 0.50 }],
    },
    {
      id: 'pi-salmao', cat: 'Peças Individuais', name: 'Nigiri Salmão (2 peças)', price: 3.50,
      desc: 'Salmão fresco sobre arroz de sushi.', img: '', tags: [],
      removable: ['Wasabi'],
      extras: [{ name: 'Wasabi extra', price: 0.30 }],
    },
    {
      id: 'pi-atum', cat: 'Peças Individuais', name: 'Nigiri Atum (2 peças)', price: 3.90,
      desc: 'Atum fresco sobre arroz de sushi.', img: '', tags: [],
      removable: ['Wasabi'],
      extras: [{ name: 'Wasabi extra', price: 0.30 }],
    },
    {
      id: 'beb-agua', cat: 'Bebidas', name: 'Água 50 cl', price: 1.50,
      desc: 'Água mineral natural.', img: '', tags: [], removable: [], extras: [],
    },
    {
      id: 'beb-ramune', cat: 'Bebidas', name: 'Ramune 200 ml', price: 2.90,
      desc: 'Refrigerante japonês com gás.', img: '', tags: [], removable: [], extras: [],
    },
    {
      id: 'sob-mochi', cat: 'Sobremesas', name: 'Mochi (3 unidades)', price: 4.50,
      desc: 'Bolinhos de arroz doce com recheio.', img: '', tags: [], removable: [], extras: [],
    },
  ],
};

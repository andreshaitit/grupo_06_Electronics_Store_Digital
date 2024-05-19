let thispage = 1;
let limit = 9;
let list = document.querySelectorAll('#list #item');
let totalPages = Math.ceil(list.length / limit);

console.log(list.length)

function loadItems() {
    let beginGet = limit * (thisPage - 1);
    let endGet = limit * thisPage;

    list.forEach((item, index) => {
        if (index >= beginGet && index < endGet) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

loadItems();
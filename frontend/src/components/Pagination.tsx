import React from 'react'

import Pagination from 'react-bootstrap/Pagination';

let active = 2;
let items:any[] = [];
for ( let number = 1; number <= 10; number++ ) {
  items.push(
    <Pagination.Item key={ number } active={ number === active }>
      { number }
    </Pagination.Item>
  );
}

export default function PaginationComponent() {
  return <Pagination>{items}</Pagination>
}

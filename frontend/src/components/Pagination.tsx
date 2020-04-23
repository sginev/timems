import React, { useState } from 'react'

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

type PaginationProperties = { 
  currentPage:number, 
  lastPage:number, 
  onAction:(page:number)=>void,
}

const PaginationComponent:React.FC<PaginationProperties> = 
({ currentPage, lastPage, onAction }) => {
  // var [ currentPage, onAction ] = useState( 1 )

  const buffer = 5;
  const buttons:(number|'...')[] = [ 1 ]
  if ( currentPage > 2 + buffer )
    buttons.push( '...' )
  const L = Math.max( 2, currentPage - buffer )
  const R = Math.min( lastPage - 1 , currentPage + buffer )
  for ( let i = L ; i <= R ; i++ )
    buttons.push( i )
  if ( currentPage < lastPage - buffer - 1 )
    buttons.push( '...' )
  buttons.push( lastPage )

  console.log( currentPage, lastPage )

  const onItemClick = pg => onAction( pg )

  return (
    <Pagination>
      { buttons.map( 
          ( pg, i ) => pg === '...' ? 
            <Pagination.Ellipsis key={ i } disabled /> :
            <Pagination.Item key={ i } onClick={ () => onItemClick( pg ) } active={ pg === currentPage }> 
              { pg } 
            </Pagination.Item> ) 
      }
    </Pagination>
  )
}

export default PaginationComponent

// <Pagination>
// <Pagination.First />
// <Pagination.Prev />
// <Pagination.Item>{1}</Pagination.Item>
// <Pagination.Ellipsis />

// <Pagination.Item>{10}</Pagination.Item>
// <Pagination.Item>{11}</Pagination.Item>
// <Pagination.Item active>{12}</Pagination.Item>
// <Pagination.Item>{13}</Pagination.Item>
// <Pagination.Item disabled>{14}</Pagination.Item>

// <Pagination.Ellipsis disabled />
// <Pagination.Item>{20}</Pagination.Item>
// <Pagination.Next />
// <Pagination.Last />
// </Pagination>
import React from 'react'

type Props = {
  className?: string
}

const PageContentBodyComponent:React.FC<Props> = ( props ) => {
  return (
    <div className={ "page-content-body " + props.className } >
      { props.children }
    </div>
  )
}

export default PageContentBodyComponent
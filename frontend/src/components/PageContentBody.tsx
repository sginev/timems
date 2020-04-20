import React from 'react'
 
const PageContentBodyComponent:React.FC = ({ children }) => {
  return (
    <div className="page-content-body">
      { children }
    </div>
  )
}

export default PageContentBodyComponent
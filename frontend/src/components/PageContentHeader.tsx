import React from 'react'
 
const PageContentHeaderComponent:React.FC<{title:string}> = ({ title, children }) => {
  return (
    <div className="page-content-header">
      <p className="title">{ title }</p>
      <p style={{ flexGrow: 1 }}></p>
      <p className="right">{ children }</p>
    </div>
  )
}

export default PageContentHeaderComponent
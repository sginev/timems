import React from "react"
import { useHistory } from "react-router-dom";
import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';

export default function AboutPage() {
  const history = useHistory();
  return (
    <div>
      <PageContentHeaderComponent title="" />
      <PageContentBodyComponent className="center-content">
        <br/>
        <h1>TOPTAL</h1>
        <h2>Time Management Test Project</h2>
        <br/>
        <br/>
        <p className="App-link" onClick={ () => history.push("/my-entries") } >
          View my entries.
        </p>
      </PageContentBodyComponent>
    </div>
  )
}
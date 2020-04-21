import React from "react"
import { useHistory } from "react-router-dom";
import PageContentHeaderComponent from '../../components/PageContentHeader';
import PageContentBodyComponent from '../../components/PageContentBody';
import { MyUserContext, User } from '../../services/user';

export default function AboutPage() {
  const myUser = React.useContext( MyUserContext ) as User;
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
        <h4>Welcome, <b>{ myUser.username }</b>!</h4>
        <br/>
        <br/>
        <br/>
        <br/>
        <p className="App-link" onClick={ () => history.push("/my-entries") } >
          Click here to view your entries.
        </p>
      </PageContentBodyComponent>
    </div>
  )
}
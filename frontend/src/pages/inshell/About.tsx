import React from "react"
import { useHistory } from "react-router-dom";
import PageContentHeaderComponent from '../../components/core/PageContentHeader';
import PageContentBodyComponent from '../../components/core/PageContentBody';
import { MyUserContext, User } from '../../utils/user';
import { APP_NAME } from '../../Configuration'

export default function AboutPage() {
  const myUser = React.useContext( MyUserContext ) as User;
  const history = useHistory();

  const renderLockedContent = () => (
    <>
      <h2>Your account has been <b>locked</b>!</h2>
      <br/>
      <p>
        Please contact an administrator or a user manager if you think this is a mistake.
      </p>
    </>
  );

  const renderRegularContent = () => (
    <>
      <br/>
      <h1>{ APP_NAME }</h1>
      <h2>Track your work hours.</h2>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <p className="App-link" onClick={ () => history.push("/my-entries") } >
        Click here to view your entries.
      </p>
    </>
  );

  return (
    <>
      <PageContentHeaderComponent title='' />
      <PageContentBodyComponent className="center-content">
        { ( myUser.role > 0 ? renderRegularContent : renderLockedContent )() }
      </PageContentBodyComponent>
    </>
  )
}

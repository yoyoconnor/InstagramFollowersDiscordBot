import './App.css'
import AuthStatus from './components/AuthStatus.jsx'
import FileUpload from './components/FileUpload.jsx'

function App() {

  // make user do their oAuth login and have the logic here
  // depending on response return relevant component

  // on the normal publicly available URL sent from discord bot
      // successful =       <AuthStatus status={'good'}/>
      // unsuccessful =     <AuthStatus status={'bad'}/> 
      // undefined? =     <AuthStatus status={''}/> 

  // on the /admin URL, make owner or moderator login with oAuth to prove identity
      // if whitelisted user =        <FileUpload accessAllowed={true}/>
      // if not a whitelisted user =        <FileUpload accessAllowed={false}/>

  return (
    <>
      <AuthStatus status={'good'}/>
      <FileUpload accessAllowed={true}/>
    </>
  )
}

export default App

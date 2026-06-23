import { createBrowserRouter } from "react-router";
import Layout from '../Layout.jsx'
import Home from '../pages/Home.jsx'
import SignUp from '../pages/SignUp.jsx'
import SignIn from '../pages/SignIn.jsx'
import FlightSearch from '../pages/FlightSearch.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "/",
        Component: Home
      },
      {
        path: "/flights/search",
        Component: FlightSearch
      },
    ]
  },
  {
    path: "/signup",
    Component: SignUp
  },
  {
    path: "/signin",
    Component: SignIn
  }
]);

export default router;
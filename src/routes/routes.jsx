import { createBrowserRouter } from "react-router";
import Layout from '../Layout.jsx'
import Home from '../pages/Home.jsx'
import SignUp from '../pages/SignUp.jsx'
import SignIn from '../pages/SignIn.jsx'
import FlightResults from '../pages/FlightResults.jsx'
import PassengerForm from '../pages/PassengerForm.jsx'  // NEW
import BookingPage from '../pages/BookingPage.jsx'      // NEW

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
        path: "/flight-results",
        Component: FlightResults
      },
      {
        path: "/passengers",           // NEW
        Component: PassengerForm
      },
      {
        path: "/booking",              // NEW
        Component: BookingPage
      }
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
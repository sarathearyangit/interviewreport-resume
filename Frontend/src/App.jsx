import { RouterProvider} from 'react-router-dom'
import { router } from './appRoutes.jsx'
import { AuthProvider } from './features/auth/authContext.jsx'
import { InterviewProvider } from './features/ai/interviewContext.jsx'

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
    
  )
}

export default App
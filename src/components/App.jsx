import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router';
import Shell from './Shell';
import Landing from './landing';
import Agents from './agents';
import Oaks from './oaks';
import Edit from './edit';
import InteractionSearch from './interactions';
import InteractionPage from './interactions/InteractionPage';
import Auth from './auth/Auth';
import Login from './auth/Login';
import Logout from './auth/Logout';
import Callback from './auth/Callback';
import Oak from './oaks/Oak';
import Agent from './agents/Agent';
import EditOaks from './edit/Oaks';
import EditAgents from './edit/Agents';
import EditSynonyms from './edit/Synonyms';
import EditSymptoms from './edit/Symptoms';
import EditReferences from './edit/References';
import EditInteractions from './edit/Interactions';
import useOaks from '../hooks/useOaks';
import useAgents from '../hooks/useAgents';
import useSymptoms from '../hooks/useSymptoms';
import useReferences from '../hooks/useReferences';



export const auth = new Auth();

const App = () => {
  const { oaks, formattedOaks } = useOaks()
  const { agents, formattedAgents } = useAgents()
  const { formattedSymptoms } = useSymptoms()
  const { formattedReferences } = useReferences()

    return (
      <div>
        <Router>
          <Shell auth={auth}>
            <Routes>
              <Route exact path="/" Component={Landing} />
              <Route path="/oaks" element={<Oaks oaks={oaks} options={formattedOaks} />}>
                  <Route path="/oaks/:id" element={<Oak />} />
              </Route>
              <Route path="/agents" element={<Agents agents={agents} options={formattedAgents} />}>
                  <Route path="/agents/:id" element={<Agent/>} />
              </Route>
              <Route path="/hi/interaction/:id" element={<InteractionPage />} />
              <Route path="/hi" element={<InteractionSearch oaks={formattedOaks} symptoms={formattedSymptoms} />} />
              <Route path="/login" element={<Login auth={auth} />} />
              <Route path="/logout" element={<Logout auth={auth} />} />
              <Route path="/edit" element={(auth.isAuthenticated() ? <Edit /> : <Navigate to='/' replace/>)}>
                  <Route path="/edit/oaks" element={<EditOaks options={formattedOaks} />} />
                  <Route path="/edit/agents" element={<EditAgents options={formattedAgents} />} />
                  <Route path="/edit/synonyms" element={<EditSynonyms options={formattedAgents} />} />
                  <Route path="/edit/symptoms" element={<EditSymptoms options={formattedSymptoms}/>} />
                  <Route path="/edit/references" element={<EditReferences options={formattedReferences} />} />
                  <Route path="/edit/interactions" element={<EditInteractions agents={formattedAgents} oaks={formattedOaks} references={formattedReferences} symptoms={formattedSymptoms} />} />
              </Route>
              <Route
                path="/callback"
                element={<Callback />}
              />
            </Routes>
          </Shell>
        </Router>
      </div>
    );
}

export default App;
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Switch, Route } from 'react-router-dom';
import EditOaks from './Oaks.jsx';
import EditAgents from './Agents.jsx';
import EditSynonyms from './Synonyms.jsx';
import EditSymptoms from './Symptoms.jsx';
import EditReferences from './References.jsx';
import EditInteractions from './Interactions.jsx';

export default class Edit extends Component {
  render() {
    let { formattedOaks, fetchOaks } = this.props;
    return (
      <div>
        <h2>Edit CODA</h2>
        <ul className="home-links">
          <li><Link to="/edit/oaks">Oaks</Link></li>
          <li><Link to="/edit/agents">Agents</Link></li>
          <li><Link to="/edit/synonyms">Synonyms</Link></li>
          <li><Link to="/edit/symptoms">Symptoms</Link></li>
          <li><Link to="/edit/references">References</Link></li>
          <li><Link to="/edit/interactions">Interactions</Link></li>
        </ul>
        <Switch>
          <Route path="/edit/oaks" render={() => <EditOaks options={formattedOaks} refresh={fetchOaks}/>}/>
          <Route path="/edit/agents" component={EditAgents}/>
          <Route path="/edit/synonyms" component={EditSynonyms}/>
          <Route path="/edit/symptoms" component={EditSymptoms}/>
          <Route path="/edit/references" component={EditReferences}/>
          <Route path="/edit/interactions" component={EditInteractions}/>
        </Switch>
      </div>
    );
  }
}

Edit.propTypes = {
  formattedOaks: PropTypes.array,
  fetchOaks: PropTypes.func
};
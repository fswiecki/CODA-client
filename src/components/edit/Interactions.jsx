import React, { useState } from 'react';
import PropTypes from 'prop-types';
import remove from 'lodash/remove';
import countBy from 'lodash/countBy';
import { getAgent } from '../../services/agents';
import { getOak } from '../../services/oaks';
import { getInteractionsByOakAndAgent, addOrUpdateHi } from '../../services/interactions';
import HiEntry from './HiEntry';
import { FullScreenSpinner } from '../shared/shapes';
import { PLANT_PARTS } from './constants';

const initialState = {
  selectedAgent: undefined,
  hiAgent: undefined,
  selectedOak: undefined,
  hiOak: undefined,
  hi: undefined,
  hiSymptoms: undefined,
  searchPerformed: false,
  plantParts: [],
  newHi: false,
};

const EditInteractions = (props) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const onAgentSelected = (option) => {
    if (!option || !option.value) {
        setData({ ...data, selectedAgent: undefined, hiAgent: undefined });
      return;
    }
    getAgent(option.value)
      .then(agent => setData({ ...data, selectedAgent: option, hiAgent: agent }));
  }

  const onOakSelected = (option) => {
    if (!option || !option.value) {
      setData({ ...data, selectedOak: undefined, hiOak: undefined });
      return;
    }
    getOak(option.value, false)
      .then(oak => setData({ ...data, selectedOak: option, hiOak: oak }));
  }

  const onInputChange = (e) => {
    const hi = { ...data.hi, [e.target.name]: e.target.value };
    setData({ ...data, hi });
  }

  const onMultiInputChange = (e) => {
    const hi = { ...data.hi };
    const inputArray = hi[e.target.name];
    const { value } = e.target;
    if (inputArray.includes(value)) {
      const index = inputArray.indexOf(value);
      inputArray.splice(index, 1);
      setData({ ...data, hi });
    } else {
      inputArray.push(value);
      setData({ ...data, hi });
    }
  }

  const onHisymptomMultiInputChange = (e, id) => {
    const hiSymptoms = [...data.hiSymptoms];
    const hiSymptToUpdate = hiSymptoms.find(hiSymptom => hiSymptom.id === id);
    const inputArray = hiSymptToUpdate[e.target.name];
    const { value } = e.target;
    if (inputArray.includes(value)) {
      remove(inputArray, element => element === value);
      setData({ ...data, hiSymptoms });
      return;
    }

    if (value === 'All' || value === 'Unknown' || value === '') {
      const symptArr = [];
      symptArr.push(value);
      hiSymptToUpdate[e.target.name] = symptArr;
      setData({ ...data, hiSymptoms });
      return;
    }

    remove(inputArray, element => element === 'All' || element === 'Unknown' || element === '');
    inputArray.push(value);
    setData({ ...data, hiSymptoms });
  }

  const onHisymptomRadioChange = (e, id) => {
    const hiSymptoms = [...this.state.hiSymptoms];
    const hiSymptToUpdate = hiSymptoms.find(hiSymptom => hiSymptom.id === id);
    hiSymptToUpdate[e.target.name.split('&')[0]] = e.target.value;
    setData({ ...data, hiSymptoms });
  }

  const onBibSelectChange = (options) => {
    const hi = { ...data.hi, bibs: options };
    setData({ ...data, hi });
  }

  const onSubsiteSelectChange = (id, options) => {
    const hiSymptoms = [...data.hiSymptoms];
    const hiSymptToUpdate = hiSymptoms.find(hiSymptom => hiSymptom.id === id);
    hiSymptToUpdate.subSite = options;
    setData({ ...data, hiSymptoms });
  }

  const onSymptomChange = (id, options) => {
    const hiSymptoms = [...data.hiSymptoms];
    const hiSymptToUpdate = hiSymptoms.find(hiSymptom => hiSymptom.id === id);
    hiSymptToUpdate.symptoms = options;
    setData({ ...data, hiSymptoms });
  }

  const onSymptomRemove = (id, plantPart) => {
    const hiSymptoms = [...data.hiSymptoms];
    const plantParts = data.plantParts.slice();
    remove(hiSymptoms, hiSympt => hiSympt.id === id);
    if (!plantParts.includes(plantPart)) {
      plantParts.push(plantPart);
    }
    setData({ ...data, hiSymptoms, plantParts });
  }

  const onMapChange = (county) => {
    const hi = { ...data.hi };
    if (hi.countiesByRegions.includes(county)) {
      remove(hi.countiesByRegions, element => element === county);
      setData({ ...data, hi });
      return;
    }
    hi.countiesByRegions.push(county);
    setData({ ...data, hi });
  }


  const onHiSubmit = () => {
    setLoading(true);
    const hi = { ...data.hi };
    const hiSymptoms = { ...data.hiSymptoms };
    hi.bibs = hi.bibs.map(bib => bib.value);
    Object.keys(hiSymptoms).forEach((key) => {
      const symptom = hiSymptoms[key];
      // Remove string ids from newly created symptoms
      if (typeof symptom.id !== 'number') {
        delete symptom.id;
      }
      symptom.isPrimary = symptom.isPrimary.join(';');
      symptom.maturity = symptom.maturity.join(';');
      symptom.subSite = symptom.subSite.map(subSite => subSite.label).join(';') || '';
    });
    hi.hiSymptoms = hiSymptoms;
    addOrUpdateHi(hi)
      .then(() => setData({ ...initialState }))
      .catch(() => setLoading(false));
  }

  const getHi = () => {
    setLoading(true);
    const hiQuery = {};
    hiQuery.agentId = data.hiAgent.id;
    hiQuery.oakId = data.hiOak.id;
    getInteractionsByOakAndAgent(hiQuery)
      .then((interaction) => {
        interaction.countiesByRegions = interaction.countiesByRegions.map(c => c.countyCode);
        interaction.hiSymptoms = interaction.hiSymptoms.filter(hiSymptom => hiSymptom.plantPart);
        interaction.hiSymptoms.forEach((hiSymptom) => {
          hiSymptom.subSite = hiSymptom.subSite.map(s => ({ label: s, value: s }));
        });
        const formattedPlantParts = countBy(interaction.hiSymptoms.map(hiSymptom => hiSymptom.plantPart));
        const plantParts = PLANT_PARTS.filter(plantPart => formattedPlantParts[plantPart] !== 2);
        setData({
          ...data,
          hi: interaction, hiSymptoms: interaction.hiSymptoms, plantParts, searchPerformed: true,
        });
        setLoading(false);
      })
      .catch(() => {
        setData({ ...data, searchPerformed: true, hi: undefined })
        setLoading(false);
      });
  }


  const addHiSymptom = (e) => {
    const plantPartToAdd = e.target.value;
    const hiSymptoms = [...data.hiSymptoms];
    const plantParts = [...data.plantParts];
    const existingPlantPart = hiSymptoms.find(hiSymptom => hiSymptom.plantPart === plantPartToAdd);
    const baseHiSymptom = {
      id: `${plantPartToAdd}-${existingPlantPart ? '1' : '2'}`,
      hostInteractionId: data.hi.id,
      plantPart: plantPartToAdd,
      isIndirect: existingPlantPart ? !existingPlantPart.isIndirect : false,
      isPrimary: [''],
      maturity: [''],
      subSite: [],
      symptoms: [],
    };
    hiSymptoms.push(baseHiSymptom);
    if (existingPlantPart) {
      remove(plantParts, plantPart => plantPart === plantPartToAdd);
    }
    setData({ ...data, hiSymptoms, plantParts });
  }

  const createHi = () => {
    const hi = {
      agentId: data.hiAgent.id,
      oakId: data.hiOak.id,
      bibs: [],
      countiesByRegions: [],
      hiSymptoms: [],
      hostLifeStage: [],
      questionable: false,
      notes: '',
      rangeData: [],
      situation: [],
    };

    setData({...data,
      hi, hiSymptoms: [], plantParts: PLANT_PARTS, newHi: true,
    });
  }

    const {
      hi, searchPerformed, newHi,
    } = data;

    const entryProps = {
      ...props,
      ...this.state,
      onOakSelected,
      onAgentSelected,
      getHi,
      onInputChange,
      onMultiInputChange,
      onBibSelectChange,
      onSubsiteSelectChange,
      onHisymptomMultiInputChange,
      onHisymptomRadioChange,
      onMapChange,
      onSymptomChange,
      onSymptomRemove,
      onHiSubmit,
      addHiSymptom,
      newHi,
    };
    return (
      <div>
        { loading ? <FullScreenSpinner /> : <HiEntry {...entryProps} /> }
        { (searchPerformed && !hi) && <div><h3>No interaction between this host and this agent has been recorded in CODA.</h3><button onClick={createHi}>Create new interaction</button></div> }
      </div>
    );
}

EditInteractions.propTypes = {
  oaks: PropTypes.array,
  agents: PropTypes.array,
  symptoms: PropTypes.array,
  references: PropTypes.array,
};

export default EditInteractions;
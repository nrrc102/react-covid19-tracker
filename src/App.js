import React, { useEffect, useState } from 'react';
import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import './App.css';
import {prettyPrintStat, sortData} from './Util';
import 'leaflet/dist/leaflet.css';
import numeral from 'numeral';

//components
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(2);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, [])

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,// United States, United Kingdom, France
            value: country.countryInfo.iso2 //UK, USA, FR
          }
        ));
        const sortedData = sortData(data);
        setTableData(sortedData);  
        setMapCountries(data)
        setCountries(countries);
      });
    };
    getCountriesData();
  }, []);

  // const onCountryChange = async (e) => {
  //   const countryCode = e.target.value;
  //   setCountry(countryCode);

  //   const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : 
  //   `https://disease.sh/v3/covid-19/countries/${countryCode}`

  //   await fetch(url)
  //   .then(response => response.json())
  //   .then(data => {
  //     setCountry(countryCode);
  //     //all of the data from the country
  //     setCountryInfo(data);
  //     setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
  //     setMapZoom(4);
  //   })
  // }
  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        countryCode === "worldwide" ? setMapZoom(3) : setMapZoom(4);
      });
  };
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange} >
            {/* Loop through all the countries and show a dropdown list of the options */}
            <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div className="app__stats">
        <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}></Table>
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

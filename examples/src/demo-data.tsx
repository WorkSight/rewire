import {arraySearch} from 'rewire-ui';

export const suggestions = [
  {id: '0',  name: 'Afghanistan'},
  {id: '1',  name: 'Aland Islands'},
  {id: '2',  name: 'Albania'},
  {id: '3',  name: 'Algeria'},
  {id: '4',  name: 'American Samoa'},
  {id: '5',  name: 'Andorra'},
  {id: '6',  name: 'Angola'},
  {id: '7',  name: 'Anguilla'},
  {id: '8',  name: 'Antarctica'},
  {id: '9',  name: 'Antigua and Barbuda'},
  {id: '10', name: 'Argentina'},
  {id: '11', name: 'Armenia'},
  {id: '12', name: 'Aruba'},
  {id: '13', name: 'Australia'},
  {id: '14', name: 'Austria'},
  {id: '15', name: 'Azerbaijan'},
  {id: '16', name: 'Bahamas'},
  {id: '17', name: 'Bahrain'},
  {id: '18', name: 'Bangladesh'},
  {id: '19', name: 'Barbados'},
  {id: '20', name: 'Belarus'},
  {id: '21', name: 'Belgium'},
  {id: '22', name: 'Belize'},
  {id: '23', name: 'Benin'},
  {id: '24', name: 'Bermuda'},
  {id: '25', name: 'Bhutan'},
  {id: '26', name: 'Bolivia, Plurinational State of'},
  {id: '27', name: 'Bonaire, Sint Eustatius and Saba'},
  {id: '28', name: 'Bosnia and Herzegovina'},
  {id: '29', name: 'Botswana'},
  {id: '30', name: 'Bouvet Island'},
  {id: '31', name: 'Brazil'},
  {id: '32', name: 'BLAH'},
  {id: '33', name: 'British Indian Ocean Territory'},
  {id: '34', name: 'Brunei Darussalam'},
];

export const employees = [
  {id: '1e',  name: 'Schrute, Dwight',         email: 'testEmail11@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: undefined                ,   selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '2e',  name: 'Scott, Michael',          email: 'testEmail22@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '3e',  name: 'Lannister, Jaime',        email: 'testEmail33@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '4e',  name: 'Dayne, Arthur',           email: 'testEmail44@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '5e',  name: 'Snow, Jon',               email: 'testEmail55@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '6e',  name: 'Stark, Ned',              email: 'testEmail66@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '7e',  name: 'Stark, Arya',             email: 'testEmail77@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '8e',  name: 'Biggus, Headus',          email: 'testEmail88@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '9e',  name: 'Drumpf, Donald',          email: 'testEmail99@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '7e',  name: 'Johnson, Ruin',           email: 'testEmail00@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '8e',  name: 'Ren, Emo',                email: 'testEmail1234@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '9e',  name: 'Swolo, Ben',              email: 'testEmail5678@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '10e', name: 'Sue, Mary',               email: 'testEmail90210@test.com',    isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '11e', name: 'Poppins, Leia',           email: 'testEmail6274309@test.com',  isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '12e', name: 'Snoke, Nobody',           email: 'testEmail13371337@test.com', isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '13e', name: 'Too tired to live, Luke', email: 'testEmail253545@test.com',   isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '1e',  name: 'Schrute, Dwight',         email: 'testEmail11@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: undefined                  , selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '2e',  name: 'Scott, Michael',          email: 'testEmail22@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '3e',  name: 'Lannister, Jaime',        email: 'testEmail33@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '4e',  name: 'Dayne, Arthur',           email: 'testEmail44@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '5e',  name: 'Snow, Jon',               email: 'testEmail55@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '6e',  name: 'Stark, Ned',              email: 'testEmail66@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '7e',  name: 'Stark, Arya',             email: 'testEmail77@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '8e',  name: 'Biggus, Headus',          email: 'testEmail88@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '9e',  name: 'Drumpf, Donald',          email: 'testEmail99@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '7e',  name: 'Johnson, Ruin',           email: 'testEmail00@test.com',       isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '8e',  name: 'Ren, Emo',                email: 'testEmail1234@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '9e',  name: 'Swolo, Ben',              email: 'testEmail5678@test.com',     isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '10e', name: 'Sue, Mary',               email: 'testEmail90210@test.com',    isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '11e', name: 'Poppins, Leia',           email: 'testEmail6274309@test.com',  isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '12e', name: 'Snoke, Nobody',           email: 'testEmail13371337@test.com', isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
  {id: '13e', name: 'Too tired to live, Luke', email: 'testEmail253545@test.com',   isActive: true, timeColumn: '7:30', autoCompleteColumn: {id: '14', name: 'Austria'}, selectColumn: {id: '14', name: 'Austria'}, numberColumn1: 1, numberColumn2: 2, numberColumn3: 3},
];

export const countries = arraySearch(suggestions, (item?) => (item && item.name) || '');
export const searcher  = arraySearch(['Yes', 'No', 'Maybe', 'Uncertain', 'Definitely Not'], (item?) => Array.isArray(item) ? '' : (item || ''));

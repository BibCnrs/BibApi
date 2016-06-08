'use strict';

require('babel/register')({ blacklist: [ 'regenerator' ] });
require('./commands/parseFedeAdminUnitsCSV');

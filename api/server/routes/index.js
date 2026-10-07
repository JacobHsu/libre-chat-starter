const accessPermissions = require('./accessPermissions');
const categories = require('./categories');
const endpoints = require('./endpoints');
const staticRoute = require('./static');
const messages = require('./messages');
const presets = require('./presets');
const prompts = require('./prompts');
const balance = require('./balance');
const banner = require('./banner');
const search = require('./search');
const models = require('./models');
const convos = require('./convos');
const config = require('./config');
const agents = require('./agents');
const roles = require('./roles');
const files = require('./files');
const auth = require('./auth');
const keys = require('./keys');
const user = require('./user');

module.exports = {
  auth,
  keys,
  user,
  roles,
  files,
  banner,
  agents,
  convos,
  search,
  config,
  models,
  prompts,
  presets,
  balance,
  messages,
  endpoints,
  categories,
  staticRoute,
  accessPermissions,
};

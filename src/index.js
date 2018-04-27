import './index.css';
import BasicApp from './components/basic-app/basic-app.js'
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import {Provider} from 'react-redux';
import {createStore} from 'redux';
import allReducers from './reducers'

//For internationalization, the most important is locale='en' and messages={enMessages}, enMessages is an object for internationalization
import {IntlProvider} from 'react-intl';
import {addLocaleData} from 'react-intl';
import viMessages from './resources/locale-data/vi'
import vi from 'react-intl/locale-data/vi';
addLocaleData(vi);


const store = createStore(
    allReducers
);

ReactDOM.render(
    <Provider store={store}>
		<IntlProvider locale='vi' messages={viMessages}>
			<BasicApp />
		</IntlProvider>
    </Provider>,
    document.getElementById('main')
);
registerServiceWorker();

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import registerServiceWorker from './registerServiceWorker';
import allReducers from './reducers'

import {IntlProvider} from 'react-intl';
import enMessages from '@boundlessgeo/sdk/locale/en';
import BasicApp from './components/basic-app/basic-app.jsx'

const store = createStore(
    allReducers
);

ReactDOM.render(
    <Provider store={store}>
		<IntlProvider locale='en' messages={enMessages}>
			<BasicApp />
		</IntlProvider>
    </Provider>,
    document.getElementById('main')
);
registerServiceWorker();

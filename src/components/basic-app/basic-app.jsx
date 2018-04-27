import './basic-app.css'
// import 'jquery-ui/themes/base/resizable.css'
import $ from 'jquery'
import 'jquery-ui/ui/widgets/draggable'
// import 'jquery-ui/ui/widgets/resizable'
import React from 'react';
import ReactDOM from 'react-dom'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MapPanel from '@boundlessgeo/sdk/components/MapPanel';
import LayerList from '@boundlessgeo/sdk/components/LayerList';
import Geocoding from '@boundlessgeo/sdk/components/Geocoding';
import GeocodingResults from '@boundlessgeo/sdk/components/GeocodingResults';
import Navigation from '@boundlessgeo/sdk/components/Navigation';
import Select from '@boundlessgeo/sdk/components/Select';
import QueryBuilder from '@boundlessgeo/sdk/components/QueryBuilder';
import FeatureTable from '@boundlessgeo/sdk/components/FeatureTable';
import Chart from '@boundlessgeo/sdk/components/Chart';
import MapConfig from '@boundlessgeo/sdk/components/MapConfig';
import Header from '@boundlessgeo/sdk/components/Header';
import Button from '@boundlessgeo/sdk/components/Button';
import DrawFeature from '@boundlessgeo/sdk/components/DrawFeature';
import Zoom from '@boundlessgeo/sdk/components/Zoom';
import InfoPopup from '@boundlessgeo/sdk/components/InfoPopup';
import EditPopup from '@boundlessgeo/sdk/components/EditPopup';
import injectTapEventPlugin from 'react-tap-event-plugin';


import '../../../node_modules/@boundlessgeo/sdk/dist/css/components.css'
import {map, charts} from './basic-app-var'


// Needed for onTouchTap. Can go away when react 1.0 release (in the future, try to replace onTouchTap by onClick)
// Check this repo: https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

class BasicApp extends React.Component {
  //Refer to link: https://medium.com/differential/react-context-and-component-coupling-86e535e2d599 for more information
  //on how the child components receive objects from parent components
  getChildContext() {
    return {
      muiTheme: getMuiTheme() //Refer to this link: http://www.material-ui.com/#/customization/themes to understand muiTheme
    };
  }
  static childContextTypes = {
    muiTheme: React.PropTypes.object
  };

  //For toggle element
  _toggle(el) {
    if (el.style.display === 'block') {
      el.style.display = 'none';
    } else {
      el.style.display = 'block';
    }
  }
  _toggleTable() {
    this._toggle(ReactDOM.findDOMNode(this.refs.tablePanel));
    this.refs.table.getWrappedInstance().setDimensionsOnState();
  }
  _toggleQuery() {
    this._toggle(ReactDOM.findDOMNode(this.refs.queryPanel));
  }
  _toggleChart() {
    this._toggle(ReactDOM.findDOMNode(this.refs.chartPanel));
  }


  render() {
    //Make draggable
    $(function() {
      $( "#QP_draggable" ).draggable();
      $( "#table-panel" ).draggable();
      $( "#Chart_draggable" ).draggable();
    } );
    
    return (
      <div id='content'>
        <Header showLeftIcon={false} title='HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH QUY HOẠCH SỬ DỤNG ĐẤT'>
          <Button toggleGroup='navigation' buttonType='Icon' iconClassName='headerIcons ms ms-table' tooltip='Bảng Thuộc Tính' onTouchTap={this._toggleTable.bind(this)}/>
          <Button toggleGroup='navigation' buttonType='Icon' iconClassName='headerIcons fa fa-filter' tooltip='Truy vấn' onTouchTap={this._toggleQuery.bind(this)}/>
          <DrawFeature toggleGroup='navigation' map={map} />
          <Select toggleGroup='navigation' map={map}/>
          <Navigation secondary={true} toggleGroup='navigation' map={map}/>
          <Geocoding />
        </Header>
        <MapPanel id='map' map={map}/>
        <div ref='queryPanel' className='query-panel' id="QP_draggable"><QueryBuilder map={map} /></div>
        <div id='geocoding-results' className='geocoding-results-panel'><GeocodingResults map={map} /></div>
        <div id='zoom-buttons'><Zoom map={map} /></div>
        <div id='layerlist'><LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} /></div>
        <div ref='tablePanel' id='table-panel' className='attributes-table'><FeatureTable toggleGroup='navigation' ref='table' map={map} /></div>
        <div id='editpopup' className='ol-popup'><EditPopup toggleGroup='navigation' map={map} /></div>
        <div id='popup' className='ol-popup'><InfoPopup toggleGroup='navigation' map={map} /></div>
      </div>
    );
  }
}

export default BasicApp
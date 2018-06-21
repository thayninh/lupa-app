#How to run
# "C:\Program Files\QGIS 3.0\bin\python-qgis.bat" C:\Dissertation_Data\lupa.py
#install *whl file: python-qgis -m pip install C:\Dissertation_Data\lxml-4.2.1-cp36-cp36m-win_amd64.whl (open cmd and run as administrator)

# =====BASIC SETUP====================================================================================================================================

import sys
import os
from lxml import etree
from qgis.core import (
     QgsApplication, 
     QgsVectorLayer,
     QgsRasterLayer
)
from qgis.analysis import QgsNativeAlgorithms

# supply path to qgis install location
QgsApplication.setPrefixPath("C:\\Program Files\\QGIS 3.0\\apps\\qgis", True)

# create a reference to the QgsApplication, setting the second argument to False disables the GUI
qgs = QgsApplication([], False)

# load providers
qgs.initQgis()

# Prepare processing framework 
sys.path.append('C:\\Program Files\\QGIS 3.0\\apps\\qgis\\python\\plugins') 
import processing
from processing.core.Processing import Processing
Processing.initialize()

# Now, if you want to use a native algorithm (i.e., an algorithm from the native provider, whose algorithms are written in C++), 
# you need to add the provider after initializing Processing:
# for example: processing.run("native:extractvertices", params)
QgsApplication.processingRegistry().addProvider(QgsNativeAlgorithms())

current_path = os.path.realpath(os.path.dirname(__file__))

# =====END BASIC SETUP====================================================================================================================================
# ========================================================================================================================================================
# ========================================================================================================================================================
# ========================================================================================================================================================
# ======FUNCTIONS=========================================================================================================================================

def getExtentQgis(in_layer):
    layer = QgsVectorLayer(in_layer, 'extent_layer', 'ogr')
    ext = layer.extent()
    x_min = ext.xMinimum()
    x_max = ext.xMaximum()
    y_min = ext.yMinimum()
    y_max = ext.yMaximum()
    extent = "{},{},{},{}".format(x_min,x_max,y_min,y_max)
    return extent

def rasterizeVector(workspace, spatial_criteria, administrative_boundary, pixel_size):
    try:
        # print("Initializing....\n")
        rasterization_result = []
        in_layer = '{}\\SpatialData\\{}.{}'.format(current_path, administrative_boundary.xpath('./@name')[0], administrative_boundary.xpath('./@type')[0])
        extent = getExtentQgis(in_layer)
        for criterion in spatial_criteria:
            name = criterion.xpath('./Data/@name')[0]
            type_ = criterion.xpath('./Data/@type')[0]
            fuzzy_type = criterion.xpath('./FuzzyType/@id')[0]
            input_ = '{}\\SpatialData\\{}.{}'.format(current_path, name, type_)
            if(type_ == 'shp' and fuzzy_type != '5'):
                # print('Rasterizing layers: {}'.format(name))
                output = '{}\\{}.tif'.format(workspace, name)
                params = {
                    'INPUT':input_,
                    'FIELD':None,
                    'BURN':0,
                    'UNITS':1,
                    'WIDTH':pixel_size,
                    'HEIGHT':pixel_size,
                    'EXTENT':extent,
                    'NODATA':9999,
                    'OPTIONS':'',
                    'DATA_TYPE':5,
                    'INIT':0,
                    'INVERT':False,
                    'OUTPUT':output}
                rasterization_result.append(processing.run("gdal:rasterize", params))
                # print('output layers: {}\n'.format(output)) 
            elif(type_ == 'tif'):
                # print('Rasterizing layers: {}'.format(name))
                layer = QgsRasterLayer(input_, 'raster file')
                output = '{}\\{}.sdat'.format(workspace, name)
                params = {
                    'INPUT':layer,
                    'KEEP_TYPE':True,
                    'SCALE_UP':0,
                    'SCALE_DOWN':0,
                    'OUTPUT_EXTENT':extent,
                    'TARGET_USER_SIZE':pixel_size,
                    'TARGET_USER_FITS':0,
                    'TARGET_TEMPLATE':None,
                    'OUTPUT':output
                    }
                rasterization_result.append(processing.run("saga:resampling", params))
                # print('output layers: {}\n'.format(output))
            elif(type_ == 'shp' and fuzzy_type == '5'):
                # print('Rasterizing layers: {}'.format(name))
                output = '{}\\LUS.tif'.format(workspace)
                numeric_field = 'lut'
                params = {
                    'INPUT':input_,
                    'FIELD':numeric_field,
                    'BURN':0,
                    'UNITS':1,
                    'WIDTH':pixel_size,
                    'HEIGHT':pixel_size,
                    'EXTENT':extent,
                    'NODATA':9999,
                    'OPTIONS':'',
                    'DATA_TYPE':5,
                    'INIT':0,
                    'INVERT':False,
                    'OUTPUT':output}
                rasterization_result.append(processing.run("gdal:rasterize", params))
                # print('output layers: {}\n'.format(output))
            else:
                raise TypeError("Input vector layer had wrong type")
        return rasterization_result
    except Exception as e:
        print("line 126: "+e)

def calculateEuclideanDistance(rasterization_result, workspace):
    try:
        # print("Calculating euclidean distance....\n")
        euclidean_results = []
        for dict_ in rasterization_result:
            input_ = dict_['OUTPUT']
            basename = os.path.basename(input_)
            name = basename.split('.')[0]
            extension = basename.split('.')[1]
            if(name == 'LUS'):
                # print("keeping layer of {}\n".format(basename))
                euclidean_results.append(input_)
            elif(extension == 'sdat'):
                # print("Converting layer of {}".format(basename))
                output = "{}\\{}.tif".format(workspace,name)
                params = {
                    'INPUT':input_,
                    'TARGET_CRS':None,
                    'NODATA':None,
                    'COPY_SUBDATASETS':True,
                    'OPTIONS':'',
                    'DATA_TYPE':5,
                    'OUTPUT':output
                    }
                euclidean_results.append(processing.run("gdal:translate", params)['OUTPUT'])
                # print('output layers: {}\n'.format(output))
            else:
                # print("Calculating layer: {}".format(basename))
                output = "{}\\disRas_{}".format(workspace, basename)
                params = {
                    'INPUT':input_,
                    'BAND':1,
                    'VALUES':'0',
                    'UNITS':0,
                    'MAX_DISTANCE':0,
                    'REPLACE':0,
                    'NODATA':9999,
                    'OPTIONS':'',
                    'DATA_TYPE':5,
                    'OUTPUT':output
                    }
                euclidean_results.append(processing.run("gdal:proximity", params)['OUTPUT'])
                # print('output layers: {}\n'.format(output))
        return euclidean_results
    except Exception as e:
        print("line 173: "+e)
    
def calculateFuzzyRaster(spatial_criteria, euclidean_results, workspace):
    try:
        # print('Calculating fuzzy raster....\n')
        fuzzy_raster_result = []
        for criterion in spatial_criteria:
            data_name = criterion.xpath('./Data/@name')[0]
            fuzzy_type = criterion.xpath('./FuzzyType/@id')[0]
            fuzzy_a = criterion.xpath('./FuzzyA/@value')[0]
            fuzzy_b = criterion.xpath('./FuzzyB/@value')[0]
            fuzzy_c = criterion.xpath('./FuzzyC/@value')[0]
            fuzzy_d = criterion.xpath('./FuzzyD/@value')[0] 
            for input_ in euclidean_results:
                layer = QgsRasterLayer(input_, 'disRas file')
                basename = os.path.basename(input_)
                name = basename.split('.')[0].replace('disRas_','')
                result = '{}\\fuzRas_{}.sdat'.format(workspace,name)
                if(fuzzy_type == '5' and name == 'LUS'):
                    # print("Calculating layer: {}".format(basename))
                    formula = "ifelse(eq(a,1),{},ifelse(eq(a,2),{},ifelse(eq(a,3),{},{})))".format(fuzzy_a,fuzzy_b,fuzzy_c,fuzzy_d)
                    params = {
                        'GRIDS':layer,
                        'XGRIDS':[layer],
                        'FORMULA':formula,
                        'RESAMPLING':0,
                        'USE_NODATA':False,
                        'TYPE':7,
                        'RESULT':result
                        }
                    fuzzy_raster_result.append(processing.run("saga:rastercalculator", params)['RESULT'])
                    # print("output layer: {}\n".format(result))
                elif(name == data_name):
                    # print("Calculating layer: {}".format(basename))
                    formula = ""
                    if(fuzzy_type == '1'):
                        formula =  "ifelse(lt(a,{}),0,ifelse(eq(a,{}),0,ifelse(lt(a,{}),(a-{})/({}-{}),1)))".format(fuzzy_a, fuzzy_a,fuzzy_b,fuzzy_a,fuzzy_b,fuzzy_a)
                    elif(fuzzy_type == '2'):
                        formula = "ifelse(lt(a,{}),1,ifelse(eq(a,{}),1,ifelse(lt(a,{}),({}-a)/({}-{}),0)))".format(fuzzy_a, fuzzy_a,fuzzy_b,fuzzy_b,fuzzy_b,fuzzy_a)
                    elif(fuzzy_type == '3'):
                        formula = "ifelse(lt(a,{}),0,ifelse(eq(a,{}),0,ifelse(lt(a,{}),(a-{})/({}-{}),ifelse(lt(a,{}),1,ifelse(eq(a,{}),1,ifelse(lt(a,{}),({}-a)/({}-{}),0))))))".format(fuzzy_a,fuzzy_a,fuzzy_b,fuzzy_a,fuzzy_b,fuzzy_a,fuzzy_c,fuzzy_c,fuzzy_d,fuzzy_d,fuzzy_d,fuzzy_c)
                    elif(fuzzy_type == '4'):
                        formula = "ifelse(lt(a,{}),0,ifelse(eq(a,{}),0,ifelse(lt(a,{}),(a-{})/({}-{}),ifelse(lt(a,{}),({}-a)/({}-{}),0))))".format(fuzzy_a,fuzzy_a,fuzzy_b,fuzzy_a,fuzzy_b,fuzzy_a,fuzzy_c,fuzzy_c,fuzzy_c,fuzzy_b)
                    else:
                        raise TypeError("Wrong fuzzy type")
                    params = {
                        'GRIDS':layer,
                        'XGRIDS':[layer],
                        'FORMULA':formula,
                        'RESAMPLING':0,
                        'USE_NODATA':False,
                        'TYPE':7,
                        'RESULT':result
                        }
                    fuzzy_raster_result.append(processing.run("saga:rastercalculator", params)['RESULT'])
                    # print("output layer: {}\n".format(result))
        return fuzzy_raster_result
    except Exception as e:
        print("line 231: "+e)

def convertSDATToTiff(fuzzy_raster_result, workspace):
    try:
        fuzzy_raster_result_converted = []
        for input_ in fuzzy_raster_result:
            basename = os.path.basename(input_)
            name = basename.split('.')[0]
            result = "{}\\{}.tif".format(workspace,name)
            params = {
                'INPUT':input_,
                'TARGET_CRS':None,
                'NODATA':None,
                'COPY_SUBDATASETS':True,
                'OPTIONS':'',
                'DATA_TYPE':5,
                'OUTPUT':result
                }
            fuzzy_raster_result_converted.append(processing.run("gdal:translate", params)['OUTPUT'])
        return fuzzy_raster_result_converted
    except Exception as e:
        print("line 252: "+e)

def calculateReasonalRaster(fuzzy_raster_result_converted, spatial_criteria, dict_group_weights, workspace):
    try:
        # print('Calculating reasonable raster....')
        dict_criterion_weights = {}
        result = '{}\\reasonableRaster.sdat'.format(workspace)
        for criterion in spatial_criteria:
            data_name = criterion.xpath('./Data/@name')[0]
            group_name = criterion.xpath('./Group/@name')[0]
            data_weight  = criterion.xpath('./Weight/@value')[0]
            fuzzy_type = criterion.xpath('./FuzzyType/@id')[0]
            if(fuzzy_type == "5"):
                data_name = "LUS"
            dict_criterion_weights[data_name] = [group_name, data_weight]

        layers = [QgsRasterLayer(input_, 'files') for input_ in fuzzy_raster_result_converted]
        formula = ""
        for i in range(len(layers)):
            layer = layers[i]
            input_ = fuzzy_raster_result_converted[i]
            basename = os.path.basename(input_)
            name = basename.split('.')[0].replace('fuzRas_','')
            weight_criterion = dict_criterion_weights[name][1]
            
            group_name_criterion = dict_criterion_weights[name][0]
            group_weight = dict_group_weights[group_name_criterion]
            variables = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']
            if(i == len(layers)-1):
                formula += "{}*{}*{}".format(variables[i],weight_criterion,group_weight)
            else:
                formula += "{}*{}*{} + ".format(variables[i],weight_criterion,group_weight)
        params = {
            'GRIDS':layers[0],
            'XGRIDS':layers[1:],
            'FORMULA':formula,
            'RESAMPLING':0,
            'USE_NODATA':False,
            'TYPE':7,
            'RESULT':result
            }
        # print('output layer: {}\n'.format(result))
        return processing.run("saga:rastercalculator", params)['RESULT']
        # return("hehe")   
    except Exception as e:
        print("line 296: "+e)

def calculateZonalStatistic(reasonable_raster, potential_locations):
    try:
        # print('Calculating zonal statistic....')
        input_vector = '{}\\SpatialData\\{}.{}'.format(current_path, potential_locations.xpath('./@name')[0], potential_locations.xpath('./@type')[0])
        params = {
            'INPUT_RASTER':reasonable_raster,
            'RASTER_BAND':1,
            'INPUT_VECTOR':input_vector,
            'COLUMN_PREFIX':'_',
            'STATS':[2]}
        spatial_reasonable_result = processing.run("qgis:zonalstatistics", params)['INPUT_VECTOR']
        # print('output layer: {}\n'.format(spatial_reasonable_result))
        return spatial_reasonable_result
    except Exception as e:
        print("line 312: "+e)

def getNonspatialWeight(dict_group_weights, nonspatial_criteria):
    try:
        # print('Calculating non spatial weight....\n')
        nonspatial_weight = {}
        for criterion in nonspatial_criteria:
            data_name = criterion.xpath('./Data/@name')[0]
            group_name = criterion.xpath('./Group/@name')[0]
            group_weight = float(dict_group_weights[group_name])
            criterion_weight = float(criterion.xpath('./Weight/@value')[0])
            locations = criterion.xpath('./locations')[0]
            for location in locations:
                location_name = location.xpath('./@name')[0]
                location_weight = float(location.xpath('./@wscore')[0])
                weight = round(location_weight * criterion_weight * group_weight, 3)
                if(location_name in nonspatial_weight.keys()):
                    nonspatial_weight[location_name] += weight
                else:
                    nonspatial_weight[location_name] = weight
        return nonspatial_weight #{'location2': xxx, 'location1': xxx}
    except Exception as e:
        print("line 334: " + e)

def calculateFinalScore(potential_locations, nonspatial_weight):
    try:
        # print('Calculating final score....\n')
        final_reasonable_score = {}
        input_vector = '{}\\SpatialData\\{}.{}'.format(current_path, potential_locations.xpath('./@name')[0], potential_locations.xpath('./@type')[0])
        layer = QgsVectorLayer(input_vector, 'potential layer', 'ogr')
        for feature in layer.getFeatures():
            object_name = feature['name']
            non_spatial_weight = round(float(nonspatial_weight[object_name]),3)
            spatial_weight = round(float(feature['_mean']),3)
            final_score = non_spatial_weight + spatial_weight
            final_reasonable_score[object_name] = {'spatialCriteria':spatial_weight, 'nonspatialCriteria':non_spatial_weight, 'finalScore':final_score}
        return final_reasonable_score
    except Exception as e:
        print("line 350: " + e)

def calculateDistanceZonal(potential_locations, euclidean_results):
    try:
        input_vector = '{}\\SpatialData\\{}.{}'.format(current_path, potential_locations.xpath('./@name')[0], potential_locations.xpath('./@type')[0])       
        for layer in euclidean_results:
            prefix = os.path.basename(layer).split('.')[0].replace("disRas_","").replace('_',"")
            params = {
                'INPUT_RASTER':layer,
                'RASTER_BAND':1,
                'INPUT_VECTOR':input_vector,
                'COLUMN_PREFIX':prefix + '_',
                'STATS':[2]}
            processing.run("qgis:zonalstatistics", params)
    except Exception as e:
        print("line 365" + e)

def dictDistanceZonal(potential_locations, euclidean_results):
    try:
        input_vector = '{}\\SpatialData\\{}.{}'.format(current_path, potential_locations.xpath('./@name')[0], potential_locations.xpath('./@type')[0])
        layer = QgsVectorLayer(input_vector, 'potential layer', 'ogr')
        dict_dist_zonal = {}
        for feature in layer.getFeatures():
            object_name = feature['name']
            dict_dist_zonal[object_name] = {}
            for in_layer in euclidean_results:
                full_name = os.path.basename(in_layer).split('.')[0].replace("disRas_","").replace('_',"")
                short_name = "{}_mean".format(full_name)[:10]
                dict_dist_zonal[object_name].update({full_name: feature[short_name]})
        return dict_dist_zonal                    
    except Exception as e:
        print("line 381: " + e)

# ======END FUNCTIONS=====================================================================================================================================
# ========================================================================================================================================================
# ========================================================================================================================================================
# ========================================================================================================================================================
# ======RUN================================================================================================================================================

# Write your code here to load some layers, use processing algorithms, etc.
def run():
    try:
        
        #Create Workspace directory
        workspace = current_path + "\\Workspace"
        if not os.path.exists(workspace):
            os.mkdir(workspace)
        
        #Parse Config.xml
        config_file = current_path + "\\Configuration\\Config.xml"
        xml_tree = etree.parse(config_file)
        
        #Get spatial criteria and nonspatial criteria
        spatial_criteria = xml_tree.xpath('//LUPA/Criteria/SpatialCriteria/Criterion')
        nonspatial_criteria = xml_tree.xpath('//LUPA/Criteria/NonSpatialCriteria/Criterion')
        group_weights = xml_tree.xpath('//LUPA/GroupWeights/Group')

        #Get basic parameters
        administrative_boundary = xml_tree.xpath('//LUPA/AdministrativeBoundary')[0]
        potential_locations = xml_tree.xpath('//LUPA/PotentialLocations')[0]
        pixel_size = int(xml_tree.xpath('//LUPA/PixelSize/@size')[0])
        data_coor = xml_tree.xpath('//LUPA/DataCoor/@id')[0]

        #Get weight of groups
        dict_group_weights = {} #{'EnvironmentGroup': '0.585', 'EconomicGroup': '0.163', 'SocialGroup': '0.251'}
        for group in group_weights:
            key = group.xpath('./@name')[0]
            value = group.xpath('./@value')[0]
            dict_group_weights[key] = value

        #Step-1: Rasterize all vector data
        rasterization_result = rasterizeVector(workspace, spatial_criteria, administrative_boundary, pixel_size)

        #Step-2: Get distance to the nearest object (Like Eucledian Distance tool in ArcGIS)
        euclidean_results = calculateEuclideanDistance(rasterization_result, workspace)
    
        #Step-3: Calculate fuzzy raster of all layers
        fuzzy_raster_result = calculateFuzzyRaster(spatial_criteria, euclidean_results, workspace)

        #Step-4: Convert from sdat to tif of fuzzy raster
        fuzzy_raster_result_converted = convertSDATToTiff(fuzzy_raster_result, workspace)

        #Step-5: Calculate reasonable raster = W_group * W_criteria * W_score
        reasonable_raster = calculateReasonalRaster(fuzzy_raster_result_converted, spatial_criteria, dict_group_weights, workspace)

        #Step-6: Calculate zonal statistic on each potential location to get reasonable score (mean quantity) in terms of spatial criteria
        spatial_reasonable_result = calculateZonalStatistic(reasonable_raster, potential_locations)
        
        #Step-7: Get nonspatial weights. for instance {'location2': xxx, 'location1': xxx}
        nonspatial_weight = getNonspatialWeight(dict_group_weights, nonspatial_criteria)
        
        #Step-8: Calculate final reasonable score of each location and store results in a dictionary {'location1': {'spatialCriteria': xxx, 'nonspatialCriteria': xxx, 'finalScore': xxx}, 'location2': {'spatialCriteria': xxx, 'nonspatialCriteria': xxx, 'finalScore': xxx}}
        final_reasonable_score = calculateFinalScore(potential_locations, nonspatial_weight)
        
        #Step-9: Calculate distance zonal in terms of each spatial criterion
        calculateDistanceZonal(potential_locations, euclidean_results)
        dict_dist_zonal = dictDistanceZonal(potential_locations, euclidean_results) #Example: dict_dist_zonal = {'location1': {'ElectricSupplyStations': 5640.478687156936, 'roads': 576.6086852174557, 'LUS': 2.0, 'slope': 0.100790761707478, 'UrbanResidentialAreas': 7336.947342619449, 'RuralResidentialAreas': 646.1213782152491, 'SurfaceWaterSources': 591.6102332688139, 'HistoricMonumentAreas': 657.5448945858284}, 'location2': {'ElectricSupplyStations': 1817.6805622059812, 'roads': 111.71509711973128, 'LUS': 2.002150537634408, 'slope': 0.326851466547059, 'UrbanResidentialAreas': 4962.380340116768, 'RuralResidentialAreas': 675.9655537266885, 'SurfaceWaterSources': 298.90933261994394, 'HistoricMonumentAreas': 899.7038061654696}}
        
        #Step-10: Produce report in HTML format
        # print('Creating report....')
        html_string = """ 
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                table {
                    font-family: arial, sans-serif;
                    border-collapse: collapse;
                    width: 100%;
                }

                td, th {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }

                th {
                    background-color: #ede1e1; 
                }
            </style>
        </head>
        <body>

            <h2>FINAL RESULT REPORT</h2>

            <table>
                <tr>
                    <th>Potential Locations</th>
                    <th>Spatial reasonable score</th>
                    <th>Non spatial reasonable score</th>
                    <th>Final reasonable score</th>
                </tr>
                """
        for location in final_reasonable_score:
            html_string += """
                <tr>
                    <td>"""+location+"""</td>
                    <td>"""+str(final_reasonable_score[location]['spatialCriteria']) +"""</td>
                    <td>"""+str(final_reasonable_score[location]['nonspatialCriteria'])+ """</td>
                    <td>"""+str(final_reasonable_score[location]['finalScore'])+ """</td>
                </tr>
                """
        html_string +="""
            </table>

            <h2>DISTANCE ANALYSIS REPORT</h2>
            <table>
                <tr>
                    <th>Potential Locations</th>
                    """
        criteria_name =list(dict_dist_zonal[list(dict_dist_zonal.keys())[0]].keys())
        for criteria in criteria_name:
            html_string += """
                    <th>"""+criteria+"""</th>
                    """
        html_string+="""
                </tr>
                """
        for location in dict_dist_zonal:
            html_string += """
                <tr>
                    <td>"""+location+"""</td>
                    """
            for criteria in criteria_name:
                html_string+="""
                    <td>"""+str(round(dict_dist_zonal[location][criteria], 3))+"""</td>
                    """
            html_string+="""
                </tr>
                """
        html_string +="""
            </table>
        </body>
        </html>
        """
        
        html_file = "{}\\report.html".format(workspace)
        with open(html_file,'w+') as f:
            f.write(html_string)
        
        # print('ouput report file: {}\n'.format(html_file))
        print('Successful Running')
    except Exception as e:
        print("line 534: " + e)

#Run algorithm
run()

# When your script is complete, call exitQgis() to remove the provider and layer registries from memory
qgs.exitQgis()

# ======END RUN============================================================================================================================================
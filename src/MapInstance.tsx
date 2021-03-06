import React, { useCallback, useEffect } from 'react';
import { useMapContext } from './hook';
const { loadModules, loadCss } = require('esri-loader');
import type MapView from "esri/views/MapView";
import type WebMap from "esri/WebMap";
import { MapProps } from './Map';
// this will lazy load the ArcGIS API
// and then use Dojo's loader to require the map class

loadCss("https://js.arcgis.com/4.16/esri/themes/dark/main.css");

const MapInstance = ({
    id,
    style,
    children,
    webMapId = null,
    centerX=10.546874999,
    centerY=35.31736,
    zoom=2,
    theme='dark',
    ...optionalProps
}: MapProps) => {

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateMap' does not exist on type 'unkno... Remove this comment to see the full error message
    const { updateMap, updateView } = useMapContext();

    const loadMap = useCallback(async () => {

        let _view: MapView, _map: WebMap;

        const loadMap = async ([MapView, WebMap]: [__esri.MapViewConstructor, __esri.WebMapConstructor]) => {
            try {
                // then we load a web map from an id
                if (webMapId) {
                    _map = new WebMap({
                        // basemap: "dark-gray-vector",
                        portalItem: {
                            id: webMapId
                        }
                    });
                } else {
                    _map = new WebMap({
                        basemap: "dark-gray-vector",
                        ...optionalProps.mapProps
                    });
                };

                const viewProps: __esri.MapViewProperties = {
                    map: _map,
                    container: id,
                    spatialReference: {
                        wkid: 102100
                    },
                    ...optionalProps.viewProps
                }

                if(centerX && centerY && !webMapId) {
                    viewProps.center = [centerX, centerY]
                };

                if(zoom && !webMapId) {
                    viewProps.zoom = zoom;
                }

                // and we show that map in a container w/ id #viewDiv
                _view = new MapView(viewProps);

                // Remove the default widgets
                _view.ui.components = [];
                // Adds widget below other elements in the top left corner of the view
                await _map.when();
                await _view.when();

                if(webMapId) {
                    _view.extent = _map.portalItem.extent
                }

                return [_map, _view]
            } catch(e) {
                return [e, e]
            }
        };

        const modules = await loadModules(['esri/views/MapView',"esri/WebMap"]);
        return await loadMap(modules);
  
      }, [centerX, centerY, id, webMapId, zoom]);

    useEffect(() => {
        let map: any, view: any;
        const asyncEffects = async () => {
            // eslint-disable-next-line no-unused-vars
            const [map, view] = await loadMap();
            view && updateView(view);
            map && updateMap(map);
        };
        !map && asyncEffects();
        return () => {
            // console.log('map destroyed');
            map && map.destroy();
            view && view.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (<div id={id} style={{ width: "100%", height: "100%", ...style }}> {children} </div >)
};

export default MapInstance;
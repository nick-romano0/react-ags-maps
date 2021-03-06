import React, { useEffect } from 'react';
import { useMapContext } from '../hook';
import type { IWidgetParams } from '../common/types';
const { loadModules } = require('esri-loader');

const LayerList = ({ expander = false, expanderDefaultOpen = false, position = "top-right" }: IWidgetParams) => {
  const { view } = useMapContext();

  useEffect(() => {
    let mounted: boolean = true;
    let layerList: __esri.LayerList;
    let layerListExpand: __esri.Expand;

    const asyncEffect = async () => {
      const reqModules = ["esri/widgets/LayerList"];
      if (expander) reqModules.push("esri/widgets/Expand");

      const [LayerList, Expand] : [__esri.LayerListConstructor, __esri.ExpandConstructor ] = await loadModules(reqModules);

      layerList = new LayerList({
        view
      });

      if(expander) {
        layerListExpand = new Expand({
          expandIconClass: "esri-icon-layers",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
          // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
          view,
          content: layerList
        });
        mounted && view?.ui.add(layerListExpand, position);

        expanderDefaultOpen && layerListExpand.expand();

      } else {
        mounted && view?.ui.add(layerList, position);
      }
    }

    view?.ready && asyncEffect();

    return () => {
      mounted = false;
      layerList?.destroy();
      layerListExpand?.destroy();
    }
  }, [view, expander, position]);

  return (<></>);

};


export default LayerList;
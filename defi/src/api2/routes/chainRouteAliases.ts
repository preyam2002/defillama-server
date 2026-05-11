import * as HyperExpress from "hyper-express";
import { chainCoingeckoIds, getChainDisplayName, getChainIdFromDisplayName } from "../../utils/normalizeChain";
import { readRouteData } from "../cache/file-cache";
import { fileResponse } from "./utils";

const chainRoutePrefixes = ["v2/historicalChainTvl", "lite/charts", "charts"];

export function getChainRouteFilePaths(routePath: string) {
  const aliasedPath = getAliasedChainRoutePath(routePath);
  if (!aliasedPath) return [routePath];
  return [routePath, aliasedPath];
}

export async function chainChartFileResponse(routePath: string, res: HyperExpress.Response) {
  const aliasedPath = getAliasedChainRoutePath(routePath);
  if (!aliasedPath) return fileResponse(routePath, res);

  const primaryData = await readRouteData(routePath, {
    readAsArrayBuffer: true,
    skipErrorLog: true,
  });
  if (primaryData) {
    res.set('Cache-Control', 'public, max-age=600');
    res.set('Content-Type', 'application/json');
    return res.send(primaryData);
  }

  return fileResponse(aliasedPath, res);
}

function getAliasedChainRoutePath(routePath: string) {
  for (const prefix of chainRoutePrefixes) {
    const routePrefix = `${prefix}/`;
    if (!routePath.startsWith(routePrefix)) continue;

    const rawChainName = routePath.slice(routePrefix.length);
    if (!rawChainName || rawChainName.includes("/")) return null;

    const chainName = decodeRouteSegment(rawChainName);
    if (!chainName || chainName.includes("/")) return null;

    const chainKey = getChainIdFromDisplayName(chainName);
    const chainLabel = getChainDisplayName(chainKey, true);
    if (chainLabel === chainName || chainCoingeckoIds[chainLabel] === undefined) return null;

    return `${prefix}/${chainLabel}`;
  }

  return null;
}

function decodeRouteSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

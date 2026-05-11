import { chainChartFileResponse, getChainRouteFilePaths } from "./chainRouteAliases";
import { readRouteData } from "../cache/file-cache";
import { fileResponse } from "./utils";

jest.mock("../cache/file-cache", () => ({
  readRouteData: jest.fn(),
}));

jest.mock("./utils", () => ({
  fileResponse: jest.fn(),
}));

describe("getChainRouteFilePaths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("falls back from old chain labels to current chart file labels", () => {
    expect(getChainRouteFilePaths("charts/Optimism")).toEqual(["charts/Optimism", "charts/OP Mainnet"]);
    expect(getChainRouteFilePaths("v2/historicalChainTvl/xDai")).toEqual([
      "v2/historicalChainTvl/xDai",
      "v2/historicalChainTvl/Gnosis",
    ]);
    expect(getChainRouteFilePaths("lite/charts/OKExChain")).toEqual(["lite/charts/OKExChain", "lite/charts/OKTChain"]);
  });

  it("keeps non-chain routes and current labels unchanged", () => {
    expect(getChainRouteFilePaths("chains")).toEqual(["chains"]);
    expect(getChainRouteFilePaths("charts/OP%20Mainnet")).toEqual(["charts/OP%20Mainnet"]);
  });
});

describe("chainChartFileResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("serves the current-label file when the old-label file is missing", async () => {
    const response = {};
    (readRouteData as jest.Mock).mockResolvedValueOnce(null);

    await chainChartFileResponse("charts/Optimism", response as any);

    expect(readRouteData).toHaveBeenCalledWith("charts/Optimism", {
      readAsArrayBuffer: true,
      skipErrorLog: true,
    });
    expect(fileResponse).toHaveBeenCalledWith("charts/OP Mainnet", response);
  });

  it("uses the normal file handler when there is no alias", async () => {
    const response = {};

    await chainChartFileResponse("charts/OP%20Mainnet", response as any);

    expect(readRouteData).not.toHaveBeenCalled();
    expect(fileResponse).toHaveBeenCalledWith("charts/OP%20Mainnet", response);
  });
});

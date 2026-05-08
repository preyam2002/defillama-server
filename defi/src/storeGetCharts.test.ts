import { getChainDefaultChartData } from "./storeGetCharts";

describe("getChainDefaultChartData", () => {
  it("does not emit negative chain TVL from rounded excluded sections", async () => {
    const chart = await getChainDefaultChartData({
      tvl: [["1778284800", 1272372]],
      liquidstaking: [["1778284800", 1027410]],
      doublecounted: [["1778284800", 244963]],
    });

    expect(chart).toEqual([{ date: 1778284800, tvl: 0 }]);
  });

  it("keeps positive chain TVL after exclusions", async () => {
    const chart = await getChainDefaultChartData({
      tvl: [["1778284800", 1272380]],
      liquidstaking: [["1778284800", 1027410]],
      doublecounted: [["1778284800", 244963]],
    });

    expect(chart).toEqual([{ date: 1778284800, tvl: 7 }]);
  });
});

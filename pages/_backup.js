import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import {
  EventTracker,
  Animation,
  ValueScale,
} from "@devexpress/dx-react-chart";
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  AreaSeries,
  BarSeries,
  ScatterSeries,
  ZoomAndPan,
  Tooltip,
} from "@devexpress/dx-react-chart-bootstrap4";
import "@devexpress/dx-react-chart-bootstrap4/dist/dx-react-chart-bootstrap4.css";
import {
  CommonSeriesSettings,
  Series,
  Reduction,
} from "devextreme-react/chart";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchData } from "../api/helper";

export default function Home() {
  const [chartData, setChartData] = useState([]);
  const [symbols, setSymbol] = useState("MSFT");
  const [click, setClick] = useState(false);
  const [loading, setLoading] = useState(true);

  const [maxPriceValue, setMaxPriceValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);

  const [averagePriceValue, setAveragePriceValue] = useState(0);
  const [averageValue, setAverageValue] = useState(0);

  const Label = (symbol) => (props) => {
    const { text } = props;
    return <ValueAxis.Label {...props} text={text + symbol} />;
  };
  const PriceLabel = Label("$");
  const LabelWithMillions = Label("K");

  useEffect(() => {
    async function getData() {
      setChartData([]);
      setLoading(true);

      let array = [];
      const result = await fetchData("/query", {
        function: "TIME_SERIES_DAILY",
        symbol: symbols,
        outputsize: "compact",
        datatype: "json",
      });
      // console.log("result", result?.["Time Series (Daily)"]);

      if (result === 429) {
        alert(
          "You have exceeded the rate limit per minute for your plan, BASIC, by the API provider"
        );
      } else {
        Object.keys(result?.["Time Series (Daily)"])
          .filter((item) => item.includes("-11-"))
          .sort()
          .map((data) => {
            array.push({
              date: data.substr(8, 2),
              real_date: data,
              price: parseFloat(
                result?.["Time Series (Daily)"][data]["4. close"]
              ),
              volume: parseFloat(
                result?.["Time Series (Daily)"][data]["5. volume"] / 1000
              ),
              open: parseFloat(
                result?.["Time Series (Daily)"][data]["1. open"]
              ),
              high: parseFloat(
                result?.["Time Series (Daily)"][data]["2. high"]
              ),
              low: parseFloat(result?.["Time Series (Daily)"][data]["3. low"]),
            });
          });

        setTimeout(() => {
          setLoading(false);
          setChartData(array);
        }, 2000);

        const averagePrice =
          array.reduce((total, next) => total + next.price, 0) / array.length;
        setAveragePriceValue(averagePrice / 4);

        const averageVolume =
          array.reduce((total, next) => total + next.volume, 0) / array.length;
        setAverageValue(averageVolume);

        const maxPrice = Math.max.apply(
          Math,
          array.map(function (o) {
            return o.price;
          })
        );
        setMaxPriceValue(maxPrice);

        const maxVolume = Math.max.apply(
          Math,
          array.map(function (o) {
            return o.volume;
          })
        );
        setMaxValue(maxVolume);
      }
      // console.log("array", array);
    }
    getData();
  }, [click]);

  const TooltipContent = (e) => {
    const items = chartData.map((data, index) => {
      if (index === parseInt(e.targetItem.point - 1)) {
        return (
          <div>
            <div>{data.real_date}</div>
            <div>O : ${data.open}</div>
            <div>H : ${data.high}</div>
            <div>L : ${data.low}</div>
            <div>C : ${data.price}</div>
            <div>V : {data.volume}K</div>
          </div>
        );
      }
    });
    return <table>{items}</table>;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Stock Charts App</title>
        <meta name='description' content='Stock Charts App' />
        <meta name='viewport' content='minimum-scale=0.1,initial-scale=0.1' />
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic-bootstrap.css'
        />
        <link
          rel='stylesheet'
          href='https://maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
        />
      </Head>

      <main className={styles.main}>
        Daily Prices (open, high, low, close) and Volumes | <b>November 2021</b>
        <div style={{ margin: "10px 0" }}>
          <input
            type='text'
            value={symbols}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder='e.g. MSFT / CNY'
          />
          <button onClick={() => setClick(!click)}>Search</button>
        </div>
        <div className='card'>
          {loading && (
            <div
              style={{
                position: "relative",
                width: "100%",
                textAlign: "center",
                height: "500px",
                paddingTop: "175px",
              }}>
              <ClipLoader color={"blue"} size={80} />
              <br />
              Loading graphs...
            </div>
          )}

          {chartData && chartData.length > 0 && (
            <Chart data={chartData}>
              <ValueScale
                name='price'
                modifyDomain={(domain) => [
                  domain[0],
                  maxPriceValue + averagePriceValue,
                ]}
              />
              <ValueScale
                name='volume'
                modifyDomain={(domain) => [domain[0], maxValue + averageValue]}
              />

              <ArgumentAxis />

              <ValueAxis scaleName='price' labelComponent={PriceLabel} />
              <ValueAxis
                scaleName='volume'
                position='right'
                labelComponent={LabelWithMillions}
                showGrid={false}
              />

              <CommonSeriesSettings argumentField='date' type='candlestick' />

              <Series
                name='candlestick'
                openValueField='open'
                highValueField='high'
                lowValueField='low'
                closeValueField='price'>
                <Reduction color='red' />
              </Series>

              <AreaSeries
                valueField='price'
                argumentField='date'
                scaleName='price'
              />
              <LineSeries
                valueField='price'
                argumentField='date'
                scaleName='price'
                color={"blue"}
              />

              <EventTracker />
              <Tooltip
                contentComponent={TooltipContent}
                // targetItem={(e) => console.log("target", e)}
              />

              <BarSeries
                valueField='volume'
                argumentField='date'
                scaleName='volume'
                color={"lightgreen"}
              />

              <Animation />
              {/* <HoverState /> */}

              <ZoomAndPan />
            </Chart>
          )}
        </div>
      </main>
    </div>
  );
}

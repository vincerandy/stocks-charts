import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import Chart, {
  CommonSeriesSettings,
  Series,
  Reduction,
  Label,
  ValueAxis,
  Tooltip,
  ZoomAndPan,
  Grid,
  Pane,
  Legend,
  ScrollBar,
} from "devextreme-react/chart";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchData } from "../api/helper";

export default function Home() {
  const [chartData, setChartData] = useState([]);
  const [symbols, setSymbol] = useState("MSFT");
  const [click, setClick] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      setLoading(true);

      let array = [];
      const result = await fetchData("/query", {
        function: "TIME_SERIES_DAILY",
        symbol: symbols,
        outputsize: "compact",
        datatype: "json",
      });

      if (result === 429) {
        alert(
          "You have exceeded the rate limit per minute for your plan, BASIC, by the API provider"
        );
      } else {
        Object.keys(result?.["Time Series (Daily)"])
          // .filter((item) => item.includes("-11-"))
          .sort()
          .map((data) => {
            array.push({
              date: data,
              o: parseFloat(result?.["Time Series (Daily)"][data]["1. open"]),
              h: parseFloat(result?.["Time Series (Daily)"][data]["2. high"]),
              l: parseFloat(result?.["Time Series (Daily)"][data]["3. low"]),
              c: parseFloat(result?.["Time Series (Daily)"][data]["4. close"]),
              v: parseFloat(
                result?.["Time Series (Daily)"][data]["5. volume"] / 1000
              ),
            });
          });

        setLoading(false);
        setChartData(array);
      }
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

  const customizeTooltip = (arg) => {
    return {
      text: arg.openValue
        ? `Open: $${arg.openValue}<br/>
Close: $${arg.closeValue}<br/>
High: $${arg.highValue}<br/>
Low: $${arg.lowValue}<br/>`
        : `Volume: ${arg.value / 1000}K`,
    };
  };

  const customizeText = (arg) => {
    return `$${arg.valueText}`;
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
      {console.log("chartData", chartData)}
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
        <div className=''>
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

          {!loading && chartData && chartData.length > 0 && (
            <Chart id='chart' dataSource={chartData}>
              <CommonSeriesSettings argumentField='date' type='candlestick' />
              <Series
                name='Stock Price'
                pane='topPane'
                axis='stocks'
                type='candleStick'
                openValueField='o'
                highValueField='h'
                lowValueField='l'
                closeValueField='c'>
                <Reduction color='red' />
              </Series>

              <Series
                name='Volume'
                pane='bottomPane'
                axis='volume'
                type='bar'
                valueField='v'
                color='#008fd8'
                barPadding={0.5}
              />

              {/* <ArgumentAxis workdaysOnly={true}>
                <Label customizeText={customizeText} />
              </ArgumentAxis> */}
              <ValueAxis tickInterval={1} name='stocks' pane='topPane'>
                <Label customizeText={customizeText} />
                <Grid visible={true} />
              </ValueAxis>
              <ValueAxis name='volume' pane='bottomPane'>
                <Grid visible={true} />
              </ValueAxis>

              <Pane name='topPane' height={400} />
              <Pane name='bottomPane' height={150} />

              <Legend
                verticalAlignment='bottom'
                horizontalAlignment='center'
                visible={false}
              />

              <Tooltip
                shared={true}
                enabled={true}
                location='edge'
                customizeTooltip={customizeTooltip}
              />
              <ScrollBar visible={true} />
              <ZoomAndPan argumentAxis='both' />
            </Chart>
          )}
        </div>
      </main>
    </div>
  );
}

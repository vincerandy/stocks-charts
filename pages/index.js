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
  const [type, setType] = useState(1);

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
          .sort()
          .forEach((data) => {
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

  const customizeTooltip = (arg) => {
    return {
      text:
        arg.seriesName === "Stock Price Candle Stick"
          ? `Open: $${arg.openValue}<br/>
Close: $${arg.closeValue}<br/>
High: $${arg.highValue}<br/>
Low: $${arg.lowValue}<br/>`
          : arg.seriesName === "Stock Price Line Series"
          ? `$${arg.value}`
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

      <main className={styles.main}>
        Daily Prices (open, high, low, close) and Volumes
        <div style={{ margin: "10px 0" }}>
          <input
            type='text'
            value={symbols}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder='e.g. MSFT / CNY'
          />
          <button onClick={() => setClick(!click)}>Search</button>
          <input
            type='radio'
            name='rdoChart'
            value={1}
            style={{ marginLeft: "20px" }}
            onClick={() => setType(1)}
            checked={type === 1 ? true : false}
          />{" "}
          Candle Stick
          <input
            type='radio'
            name='rdoChart'
            value={2}
            style={{ marginLeft: "20px" }}
            onClick={() => setType(2)}
            checked={type === 2 ? true : false}
          />{" "}
          Line Series
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
              <CommonSeriesSettings argumentField='date' />

              {type === 1 ? (
                <Series
                  name='Stock Price Candle Stick'
                  pane='topPane'
                  axis='stocks'
                  type='candleStick'
                  openValueField='o'
                  highValueField='h'
                  lowValueField='l'
                  closeValueField='c'>
                  <Reduction color='red' />
                </Series>
              ) : (
                <Series
                  name='Stock Price Line Series'
                  type='spline'
                  axis='stocks'
                  valueField='c'
                  pane='topPane'
                />
              )}

              <Series
                name='Volume'
                pane='bottomPane'
                axis='volume'
                type='bar'
                valueField='v'
                color='#008fd8'
                barPadding={0.5}
              />

              <ValueAxis tickInterval={1} name='stocks' pane='topPane'>
                <Label customizeText={customizeText} />
                <Grid visible={true} />
              </ValueAxis>
              <ValueAxis name='volume' pane='bottomPane'>
                <Grid visible={true} />
              </ValueAxis>

              <Pane name='topPane' height={400} />
              <Pane name='bottomPane' height={200} />

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

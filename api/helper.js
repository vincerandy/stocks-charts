import api from "./api";

export const fetchData = async (endpoint, params) => {
  const config = {
    headers: {
      "x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
      "x-rapidapi-key": "09cd521d93msh6cf6552952682efp196d73jsn7ab29ddb05da",
    },
    params,
  };

  let response = [];

  try {
    response = await api.get(endpoint, config);
  } catch (err) {
    console.log("Error caught with GET request:", err);

    return err?.response?.status;
  }

  return response.data;
};

export const postData = async (endpoint, payload) => {
  const headers = {
    headers: {
      "x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
      "x-rapidapi-key": "09cd521d93msh6cf6552952682efp196d73jsn7ab29ddb05da",
    },
  };

  const postObj = JSON.stringify(payload);

  let response = [];

  try {
    response = await api.post(endpoint, postObj, headers);
  } catch (err) {
    return err;
  }

  return response.data;
};

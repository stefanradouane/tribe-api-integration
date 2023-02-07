import fetch from 'node-fetch';

export const handler = async (event) => {
    const query = event.rawQuery;
    const doubleQuery = query.search("&") == -1 ? false : true // Boolean
    let queryObject;

    if(doubleQuery) {
        const firstParam = query.slice(0, query.search("&"))
        const firstQueryType = firstParam.slice(0, firstParam.search("="))
        const firstParamValue = firstParam.slice(-(firstParam.length - firstParam.search("=") - 1))

        const secondParam = query.slice(-(query.length - query.search("&") - 1))
        const secondQueryType = secondParam.slice(0, secondParam.search("="))
        const secondParamValue = secondParam.slice(-(secondParam.length - secondParam.search("=") - 1))

        queryObject = {
            [firstQueryType]: firstParamValue,
            [secondQueryType]: secondParamValue,
        }
    } else if (!doubleQuery) {
        const firstQueryType = query.slice(0, query.search("="))
        const firstParamValue = query.slice(-(query.length - query.search("=") - 1))
        queryObject = {[firstQueryType]: firstParamValue}
    }
    
    let res = await fetch(`https://whois.fdnd.nl/api/v1/members?first=200`)

    let data = await res.json();

    return {
      statusCode: 200,
      headers: {
        /* Required for CORS support to work */
        'Access-Control-Allow-Origin': '*',
        /* Required for cookies, authorization headers with HTTPS */
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        data: queryObject
      })
    }
  }
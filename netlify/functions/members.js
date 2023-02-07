import fetch from 'node-fetch';

export const handler = async (event) => {
  const APIbase: "https://whois.fdnd.nl/api/v1";

  const APIendpoints = {
    tribes: "tribes",
    members: "members",
    member: "member",
    squads: "squads",
    squad: "sqaud",
  }

    let res = await fetch(`https://whois.fdnd.nl/api/v1/members?${event.rawQuery}`)
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
        data: data
      })
    }
  }
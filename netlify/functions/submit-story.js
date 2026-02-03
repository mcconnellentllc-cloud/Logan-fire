// Netlify serverless function to securely handle story submissions
// API keys are stored in Netlify environment variables, NOT in client-side code

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Get API keys from environment variables (set in Netlify dashboard)
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Stories';

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const requestBody = JSON.parse(event.body);
    const { action, email, data, recordId } = requestBody;

    // Handle different actions
    if (action === 'find') {
      // Find existing record by email
      if (!email) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ record: null })
        };
      }

      const filterFormula = encodeURIComponent(`{Email}="${email}"`);
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}?filterByFormula=${filterFormula}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        }
      );

      const result = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          record: result.records && result.records.length > 0 ? result.records[0] : null
        })
      };

    } else if (action === 'create') {
      // Create new record
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: data })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // If attachment fields cause errors, retry without them
        if (result.error?.message?.includes('Attachments')) {
          const cleanData = { ...data };
          delete cleanData['Attachments'];
          delete cleanData['Attachments 2'];

          const retryResponse = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fields: cleanData })
            }
          );

          const retryResult = await retryResponse.json();
          return {
            statusCode: retryResponse.ok ? 200 : 400,
            headers,
            body: JSON.stringify(retryResult)
          };
        }

        return {
          statusCode: 400,
          headers,
          body: JSON.stringify(result)
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };

    } else if (action === 'update') {
      // Update existing record
      if (!recordId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Record ID required for update' })
        };
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields: data })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // If attachment fields cause errors, retry without them
        if (result.error?.message?.includes('Attachments')) {
          const cleanData = { ...data };
          delete cleanData['Attachments'];
          delete cleanData['Attachments 2'];

          const retryResponse = await fetch(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fields: cleanData })
            }
          );

          const retryResult = await retryResponse.json();
          return {
            statusCode: retryResponse.ok ? 200 : 400,
            headers,
            body: JSON.stringify(retryResult)
          };
        }

        return {
          statusCode: 400,
          headers,
          body: JSON.stringify(result)
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', message: error.message })
    };
  }
};

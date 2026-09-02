import { api } from '../services/api';

/**
 * Comprehensive Dictionary of Indian Cities -> States & default Pincodes
 */
export const CITY_STATE_MAP = {
  jaipur: { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  mansarovar: { city: 'Jaipur', state: 'Rajasthan', pincode: '302020' },
  sitapura: { city: 'Jaipur', state: 'Rajasthan', pincode: '302022' },
  malviyanagar: { city: 'Jaipur', state: 'Rajasthan', pincode: '302017' },
  vaishalinagar: { city: 'Jaipur', state: 'Rajasthan', pincode: '302021' },
  rajapark: { city: 'Jaipur', state: 'Rajasthan', pincode: '302004' },
  cscheme: { city: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
  jagatpura: { city: 'Jaipur', state: 'Rajasthan', pincode: '302017' },
  tonkroad: { city: 'Jaipur', state: 'Rajasthan', pincode: '302018' },
  sanganer: { city: 'Jaipur', state: 'Rajasthan', pincode: '302029' },
  pratapnagar: { city: 'Jaipur', state: 'Rajasthan', pincode: '302033' },
  jodhpur: { city: 'Jodhpur', state: 'Rajasthan', pincode: '342001' },
  udaipur: { city: 'Udaipur', state: 'Rajasthan', pincode: '313001' },
  kota: { city: 'Kota', state: 'Rajasthan', pincode: '324001' },
  ajmer: { city: 'Ajmer', state: 'Rajasthan', pincode: '305001' },
  bikaner: { city: 'Bikaner', state: 'Rajasthan', pincode: '334001' },
  alwar: { city: 'Alwar', state: 'Rajasthan', pincode: '301001' },

  noida: { city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
  greaternoida: { city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201308' },
  ghaziabad: { city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001' },
  indirapuram: { city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014' },
  lucknow: { city: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
  kanpur: { city: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001' },
  varanasi: { city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' },
  agra: { city: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
  prayagraj: { city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001' },
  allahabad: { city: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001' },
  meerut: { city: 'Meerut', state: 'Uttar Pradesh', pincode: '250001' },

  delhi: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
  newdelhi: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },

  gurugram: { city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  gurgaon: { city: 'Gurugram', state: 'Haryana', pincode: '122001' },
  faridabad: { city: 'Faridabad', state: 'Haryana', pincode: '121001' },
  panchkula: { city: 'Panchkula', state: 'Haryana', pincode: '134109' },

  bengaluru: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  bangalore: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
  whitefield: { city: 'Bengaluru', state: 'Karnataka', pincode: '560066' },
  koramangala: { city: 'Bengaluru', state: 'Karnataka', pincode: '560034' },
  indiranagar: { city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
  hsrlayout: { city: 'Bengaluru', state: 'Karnataka', pincode: '560102' },
  mysuru: { city: 'Mysuru', state: 'Karnataka', pincode: '570001' },

  mumbai: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  pune: { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  thane: { city: 'Thane', state: 'Maharashtra', pincode: '400601' },
  nagpur: { city: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
  nashik: { city: 'Nashik', state: 'Maharashtra', pincode: '422001' },
  navimumbai: { city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703' },
  bandra: { city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
  andheri: { city: 'Mumbai', state: 'Maharashtra', pincode: '400058' },
  powai: { city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },

  hyderabad: { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  secunderabad: { city: 'Hyderabad', state: 'Telangana', pincode: '500003' },
  gachibowli: { city: 'Hyderabad', state: 'Telangana', pincode: '500032' },
  banjarahills: { city: 'Hyderabad', state: 'Telangana', pincode: '500034' },

  chennai: { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  coimbatore: { city: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
  madurai: { city: 'Madurai', state: 'Tamil Nadu', pincode: '625001' },

  kolkata: { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  saltlake: { city: 'Kolkata', state: 'West Bengal', pincode: '700091' },
  howrah: { city: 'Kolkata', state: 'West Bengal', pincode: '711101' },

  ahmedabad: { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
  surat: { city: 'Surat', state: 'Gujarat', pincode: '395001' },
  vadodara: { city: 'Vadodara', state: 'Gujarat', pincode: '390001' },
  rajkot: { city: 'Rajkot', state: 'Gujarat', pincode: '360001' },

  indore: { city: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
  bhopal: { city: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
  gwalior: { city: 'Gwalior', state: 'Madhya Pradesh', pincode: '474001' },

  chandigarh: { city: 'Chandigarh', state: 'Chandigarh', pincode: '160001' },
  ludhiana: { city: 'Ludhiana', state: 'Punjab', pincode: '141001' },
  amritsar: { city: 'Amritsar', state: 'Punjab', pincode: '143001' },
  jalandhar: { city: 'Jalandhar', state: 'Punjab', pincode: '144001' },

  dehradun: { city: 'Dehradun', state: 'Uttarakhand', pincode: '248001' },
  haridwar: { city: 'Haridwar', state: 'Uttarakhand', pincode: '249401' },

  patna: { city: 'Patna', state: 'Bihar', pincode: '800001' },
  ranchi: { city: 'Ranchi', state: 'Jharkhand', pincode: '834001' },
  bhubaneswar: { city: 'Bhubaneswar', state: 'Odisha', pincode: '751001' },

  kochi: { city: 'Kochi', state: 'Kerala', pincode: '682001' },
  thiruvananthapuram: { city: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001' },

  guwahati: { city: 'Guwahati', state: 'Assam', pincode: '781001' },
  visakhapatnam: { city: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001' },
  vijayawada: { city: 'Vijayawada', state: 'Andhra Pradesh', pincode: '520001' }
};

/**
 * Resolve City, State, Pincode from an Area/Locality Input text.
 * Performs fast local dictionary matching + API location search + Indian Pincode lookup + Geocoding fallback.
 */
export async function resolveLocationFromInput(queryStr) {
  if (!queryStr || typeof queryStr !== 'string' || !queryStr.trim()) {
    return null;
  }

  const cleanQuery = queryStr.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Check for 6-digit Indian Pincode in the text
  const pincodeMatch = cleanQuery.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    const pin = pincodeMatch[0];
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          city: po.District || po.Division || po.Block || '',
          state: po.State || '',
          pincode: pin,
          area: po.Name || cleanQuery
        };
      }
    } catch (_) {}
  }

  // 2. Search local database via api.getLocations
  try {
    const locs = await api.getLocations({ search: cleanQuery });
    if (Array.isArray(locs) && locs.length > 0) {
      const best = locs[0];
      if (best.city || best.state || best.pincode) {
        return {
          city: best.city || '',
          state: best.state || '',
          pincode: best.pincode || '',
          area: best.area || best.society_name || cleanQuery
        };
      }
    }
  } catch (_) {}

  // 3. Match against CITY_STATE_MAP tokens
  const tokens = lowerQuery.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    if (CITY_STATE_MAP[token]) {
      const match = CITY_STATE_MAP[token];
      return {
        city: match.city,
        state: match.state,
        pincode: match.pincode,
        area: cleanQuery
      };
    }
  }

  for (const [key, value] of Object.entries(CITY_STATE_MAP)) {
    if (key.length >= 4 && lowerQuery.includes(key)) {
      return {
        city: value.city,
        state: value.state,
        pincode: value.pincode,
        area: cleanQuery
      };
    }
  }

  // 4. Free OpenStreetMap Nominatim Geocoding Fallback
  if (cleanQuery.length >= 3) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&countrycodes=in&limit=1`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].address) {
        const addr = data[0].address;
        const fetchedCity = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.county || '';
        const fetchedState = addr.state || '';
        const fetchedPin = addr.postcode || '';
        if (fetchedCity || fetchedState) {
          return {
            city: fetchedCity,
            state: fetchedState,
            pincode: fetchedPin,
            area: cleanQuery
          };
        }
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Fetch autocomplete suggestions for location inputs
 */
export async function fetchLocationSuggestions(queryStr) {
  if (!queryStr || typeof queryStr !== 'string' || queryStr.trim().length < 2) {
    return [];
  }

  const cleanQuery = queryStr.trim();
  const results = [];
  const addedKeys = new Set();

  try {
    const locs = await api.getLocations({ search: cleanQuery });
    if (Array.isArray(locs)) {
      locs.forEach(loc => {
        const area = loc.area || loc.society_name || loc.name || '';
        const city = loc.city || '';
        const state = loc.state || '';
        const pincode = loc.pincode || '';
        const key = `${area}-${city}-${pincode}`.toLowerCase();
        if (!addedKeys.has(key) && area) {
          addedKeys.add(key);
          results.push({ area, city, state, pincode, fullText: `${area}${city ? ', ' + city : ''}${state ? ', ' + state : ''}${pincode ? ' - ' + pincode : ''}` });
        }
      });
    }
  } catch (_) {}

  // Match against CITY_STATE_MAP
  const lowerQuery = cleanQuery.toLowerCase();
  for (const [key, value] of Object.entries(CITY_STATE_MAP)) {
    if (key.includes(lowerQuery) || value.city.toLowerCase().includes(lowerQuery) || value.state.toLowerCase().includes(lowerQuery)) {
      const area = key.charAt(0).toUpperCase() + key.slice(1);
      const k = `${area}-${value.city}-${value.pincode}`.toLowerCase();
      if (!addedKeys.has(k)) {
        addedKeys.add(k);
        results.push({
          area,
          city: value.city,
          state: value.state,
          pincode: value.pincode,
          fullText: `${value.city}${value.state ? ', ' + value.state : ''} - ${value.pincode}`
        });
      }
    }
  }

  return results.slice(0, 6);
}

/**
 * Fetch City and State by Indian 6-digit Pincode
 */
export async function fetchDetailsByPincode(pin) {
  const cleanPin = String(pin || '').replace(/[^0-9]/g, '').trim();
  if (cleanPin.length !== 6) return null;

  // 1. Try free official India Post Pincode API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Division || po.Block || po.Circle || '';
        const state = po.State || '';
        if (city || state) {
          return { city, state, pincode: cleanPin };
        }
      }
    }
  } catch (err) {
    console.warn('India Post Pincode API fetch note:', err);
  }

  // 2. Try OpenStreetMap Nominatim Geocoding API by pincode
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${cleanPin}&country=india&addressdetails=1&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].address) {
        const addr = data[0].address;
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.county || '';
        const state = addr.state || '';
        if (city || state) {
          return { city, state, pincode: cleanPin };
        }
      }
    }
  } catch (_) {}

  // 3. Fallback check in CITY_STATE_MAP
  for (const item of Object.values(CITY_STATE_MAP)) {
    if (item.pincode === cleanPin) {
      return { city: item.city, state: item.state, pincode: cleanPin };
    }
  }

  return null;
}

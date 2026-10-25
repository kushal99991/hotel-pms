import { useState, useEffect } from "react";
import axios from "axios";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
  Button,
  Divider,
  Panel,
  Form,
  InputGroup,
  Grid,
  Row,
  Col,
} from "rsuite";
import { appConfig } from "config/app.config";
import { isEmpty } from "utils/helperFunctions/strings";
import { Box, Typography, Modal } from "@mui/material";

export function TextFieldSimple(props: any) {
  const { name, accepter, ...rest } = props;
  return <Form.Control name={name} accepter={accepter} {...rest} />;
}

type TCardReader = {
  id: string;
  label: string;
  status: string;
  serial_number: string;
  location: string;
  removed?: boolean;
};

type TReaderLocationAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type TReaderLocation = {
  id: string;
  display_name: string;
  address: TReaderLocationAddress;
};

type TReaderLocationState = {
  display_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const CardReaderView = (props: {
  reader: TCardReader;
  onRemove: (id: string) => void;
}) => {
  const { reader, onRemove } = props;
  return (
    <Panel bordered bodyFill style={{ padding: 10 }} key={reader.id}>
      <h5>{reader.label}</h5>
      <Typography component="p">Status: {reader.status}</Typography>
      <Typography component="p">Reader: {reader.id}</Typography>
      <Typography component="p">SN #: {reader.serial_number}</Typography>
      <Typography component="p">Location: {reader.location}</Typography>
      <Divider />
      <Button onClick={() => onRemove(reader.id)}>Unlink</Button>
    </Panel>
  );
};

const CardReaderLocationView = (props: {
  location: TReaderLocation;
  onRemove: (id: string) => void;
}) => {
  const { location, onRemove } = props;
  return (
    <Panel bordered bodyFill style={{ padding: 10 }} key={location.id}>
      <h5>{location.display_name}</h5>
      <p>{location.id}</p>
      <p>
        {location.address.line1} {location.address.line2}{" "}
        {location.address.city}, {location.address.state}{" "}
        {location.address.postal_code}
      </p>
      <Divider />
      <Button onClick={() => onRemove(location.id)}>Delete</Button>
    </Panel>
  );
};

const PairCardReader = () => {
  const [refresh, setRefresh] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [locationId, setLocationId] = useState("");
  const [label, setLabel] = useState("");
  const [status, setStatus] = useState("");
  const [readers, setReaders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationModal, setLocationModal] = useState(false);
  const [locationData, setLocationData] = useState({
    display_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [processingRequest, setProcessingRequest] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-KEY": appConfig.paymentsAPIKey,
    Authorization: appConfig.getCookie("auth"),
  });

  const newLocation = () => {
    setLocationModal(true);
  };

  const createLocation = async () => {
    const url = `${appConfig.paymentsAPI}/stripe/location`;
    for (const key in locationData) {
      const idx = key as keyof TReaderLocationState;
      if (key !== "line2" && isEmpty(locationData[idx])) {
        alert(`Please enter ${key}`);
        return;
      }
    }
    setProcessingRequest(true);
    try {
      const resp = await axios.post(url, locationData, {
        headers: getHeaders(),
      });

      if (resp.data.success) {
        setLocationModal(false);
      }
      if (resp.data.error) {
        alert(resp.data.error);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setProcessingRequest(false);
      await fetchLocations();
    }
  };

  const deleteLocation = async (id: string) => {
    setProcessingRequest(true);
    const url = `${appConfig.paymentsAPI}/stripe/location/${id}`;
    try {
      const updateLocationState = locations.filter(
        (location: TReaderLocation) => location.id !== id
      );
      setLocations([...updateLocationState]);
      await axios.delete(url, { headers: getHeaders() });
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setProcessingRequest(false);
      await fetchLocations();
    }
  };

  const handleLocationChange = (key = "", val = "") => {
    setLocationData((prev) => ({ ...prev, [key]: val }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const reader_id = await appConfig.getLocal("card_reader_id");
      if (reader_id) {
        setStatus(`Current Reader paired: ${reader_id}`);
      }
      const resp = await axios.get(
        `${appConfig.paymentsAPI}/stripe/reader/list`,
        { headers: getHeaders() }
      );
      if (resp.data.success) {
        if (resp.data) {
          setReaders(resp.data.readers.data);
        }
      }
      await fetchLocations();
    };

    fetchData();
  }, [refresh]);

  const fetchLocations = async () => {
    const resp = await axios.get(
      `${appConfig.paymentsAPI}/stripe/locations/list`,
      { headers: getHeaders() }
    );
    if (resp.data.success) {
      if (resp.data) {
        setLocations(resp.data.locations.data);
      }
    }
  };

  const handlePairingCodeChange = (val: string) => {
    setPairingCode(val);
  };
  const handleLocationIdChange = (val: string) => {
    setLocationId(val);
  };
  const handleLabelChange = (val: string) => {
    setLabel(val);
  };

  const pairReader = async () => {
    if (isEmpty(pairingCode)) {
      setStatus("Please enter the pairing code.");
      return;
    }
    if (isEmpty(locationId)) {
      setStatus("Please enter the location id.");
      return;
    }
    if (isEmpty(label)) {
      setStatus("Please enter the label");
      return;
    }

    setStatus("Pairing reader...");

    try {
      const response = await fetch(
        `${appConfig.paymentsAPI}/stripe/pair/reader`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            pairing_code: pairingCode,
            location_id: locationId,
            label,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus(`Reader paired successfully! id: ${data.reader_id}`);
        appConfig.setLocal("card_reader_id", `${data.reader_id}`);
        setRefresh(!refresh);
      } else {
        setStatus(`Failed to pair reader: ${data.error}`);
      }
    } catch (err) {
      setStatus(`Failed to pair reader: ${err}`);
    }
  };

  const removeReader = async (id: string) => {
    const deleted = await axios.delete(
      `${appConfig.paymentsAPI}/stripe/remove/reader/${id}`,
      { headers: getHeaders() }
    );

    if (deleted.data?.success) {
      setStatus("Card Reader Removed");
      const reader_array = readers.filter(
        (reader: TCardReader) => reader.id !== id
      );
      setReaders([...reader_array]);
    }
  };

  return (
    <Panel bordered shaded>
      <Typography variant="h5">Card Reader Pairing</Typography>
      <Grid fluid>
        <Row className="show-grid">
          <Col xs={24} sm={24} md={12}>
            <Box>
              {status && <Typography component="p">{status}</Typography>}
            </Box>
            <Form style={{ padding: 30 }}>
              <Form.Group controlId="pairing-code">
                <Form.ControlLabel>Pairing Code</Form.ControlLabel>
                <InputGroup>
                  <TextFieldSimple
                    name="pairing-code"
                    value={pairingCode}
                    onChange={(val: string) =>
                      handlePairingCodeChange(val.trim())
                    }
                  />
                  <InputGroup.Addon>
                    <PhonelinkSetupIcon />
                  </InputGroup.Addon>
                </InputGroup>
                <Form.HelpText>
                  This can be found in the settings on the Stripe Card Reader
                </Form.HelpText>
              </Form.Group>

              <Form.Group controlId="location-id">
                <Form.ControlLabel>Location ID</Form.ControlLabel>
                <InputGroup>
                  <TextFieldSimple
                    name="location-id"
                    value={locationId}
                    onChange={(val: string) =>
                      handleLocationIdChange(val.trim())
                    }
                  />
                  <InputGroup.Addon>
                    <EditLocationAltIcon />
                  </InputGroup.Addon>
                </InputGroup>
                <Form.HelpText>
                  This is found in the stripe console under
                  payment/terminals/locations <br />
                  <Button size="sm" onClick={newLocation}>
                    new location
                  </Button>
                </Form.HelpText>
              </Form.Group>

              <Form.Group controlId="label">
                <Form.ControlLabel>Label</Form.ControlLabel>
                <InputGroup>
                  <TextFieldSimple
                    name="label"
                    value={label}
                    onChange={(val: string) => handleLabelChange(val.trim())}
                  />
                  <InputGroup.Addon>
                    <LocalOfferIcon />
                  </InputGroup.Addon>
                </InputGroup>
                <Form.HelpText>Unique Name To Identify Terminal</Form.HelpText>
              </Form.Group>
            </Form>
            <div style={{ textAlign: "center" }}>
              <Button onClick={pairReader}>Pair Reader</Button>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Typography variant="h6">Card Reader List:</Typography>
            <Divider />
            {readers.map((reader: TCardReader) => (
              <CardReaderView
                key={reader.id}
                reader={reader}
                onRemove={removeReader}
              />
            ))}
            <Divider />
            <Typography variant="h6">Locations:</Typography>
            <Typography variant="body1">
              {processingRequest ? "Processing Request" : ""}
            </Typography>
            <Divider />
            <div style={{ maxHeight: 400, overflowY: "scroll" }}>
              {locations.map((location: TReaderLocation) => (
                <CardReaderLocationView
                  key={location.id}
                  location={location}
                  onRemove={deleteLocation}
                />
              ))}
            </div>
          </Col>
        </Row>
      </Grid>

      <Modal open={locationModal} onClose={() => {}}>
        <div
          style={{
            background: "#FFF",
            padding: 30,
            height: "100vh",
            margin: 0,
            overflowY: "scroll",
          }}
        >
          <Row>
            <Col xs={12} sm={12} md={12}>
              <Typography variant="h5">
                Create Location <EditLocationAltIcon />
              </Typography>
              <Typography variant="body2">
                Make Sure you give a clear descriptive names.
              </Typography>
            </Col>

            <Col xs={12} sm={12} md={12}>
              <Button
                className="float-end"
                onClick={() => setLocationModal(false)}
              >
                Close
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24}>
              <Divider />
              <Form style={{ padding: 30 }}>
                <Row>
                  <Col xs={24}>
                    {processingRequest ? "Processing Request" : ""}{" "}
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.display_name">
                      <Form.ControlLabel>Label</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.display_name"
                          value={locationData.display_name}
                          onChange={(val: string) =>
                            handleLocationChange("display_name", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.line1">
                      <Form.ControlLabel>Address:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.line1"
                          value={locationData.line1}
                          onChange={(val: string) =>
                            handleLocationChange("line1", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.line2">
                      <Form.ControlLabel>Address 2:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.line1"
                          value={locationData.line2}
                          onChange={(val: string) =>
                            handleLocationChange("line2", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.city">
                      <Form.ControlLabel>City:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.city"
                          value={locationData.city}
                          onChange={(val: string) =>
                            handleLocationChange("city", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.state">
                      <Form.ControlLabel>State:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.state"
                          value={locationData.state}
                          onChange={(val: string) =>
                            handleLocationChange("state", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.postal_code">
                      <Form.ControlLabel>Zip:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.postal_code"
                          value={locationData.postal_code}
                          onChange={(val: string) =>
                            handleLocationChange("postal_code", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Group controlId="locationData.country">
                      <Form.ControlLabel>Country:</Form.ControlLabel>
                      <InputGroup>
                        <TextFieldSimple
                          name="locationData.country"
                          value={locationData.country}
                          onChange={(val: string) =>
                            handleLocationChange("country", val.trim())
                          }
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Col xs={24} sm={24} md={24} style={{ marginTop: 20 }}>
                  <Button onClick={() => setLocationModal(false)}>
                    Cancel
                  </Button>{" "}
                  <Button
                    disabled={processingRequest}
                    style={{ backgroundColor: "green", color: "#FFF" }}
                    onClick={createLocation}
                  >
                    Submit
                  </Button>
                </Col>
              </Form>
            </Col>
          </Row>
        </div>
      </Modal>
    </Panel>
  );
};

export default PairCardReader;

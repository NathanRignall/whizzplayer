import { useState, useEffect, forwardRef } from "react";
import { mutate } from "swr";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

import { StickyError } from "../common/errors";

import { Form, Button, Spinner, Col } from "react-bootstrap";

// axios request urls
const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/lookup";
const PLAY_URI = process.env.NEXT_PUBLIC_API_URL + "/app/play";
const STATUS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/status";

// form schema
const schema = yup.object().shape({
    TrackID: yup.string().required(),
});

// track selector component
const TrackSelector = (props) => {
    // send details back to formik
    const { setFieldValue } = useFormikContext();

    // hold the current status
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [singleSelections, setSingleSelections] = useState([]);

    // if a single item is selected set the formik status
    useEffect(() => {
        if (singleSelections.length > 0) {
            console.log(singleSelections[0]);
            setFieldValue(props.name, singleSelections[0].TrackID);
        }
    }, [singleSelections]);

    // main feild searcher
    const handleSearch = (query) => {
        // make the axios request for track search
        axios
            .get(`${SEARCH_URI}?search=${query}`)
            .then((response) => {
                // put the response into array
                const options = response.data.payload.map((items) => ({
                    TrackName: items.TrackName,
                    TrackID: items.TrackID,
                }));
                // set the options state to this new array
                setOptions(options);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 400) {
                        console.log("No results in track search");
                    } else {
                        console.log("Error with response in track search");
                    }
                } else if (error.request) {
                    console.log("No response in track search");
                } else {
                    console.log("Axios error in track search");
                }
                // set options to itself
                setOptions(options);
            });
    };

    const filterBy = () => true;

    return (
        <AsyncTypeahead
            id={props.name}
            name={props.name}
            multiple={false}
            filterBy={filterBy}
            isLoading={isLoading}
            labelKey="TrackName"
            minLength={2}
            onSearch={handleSearch}
            options={options}
            onChange={setSingleSelections}
            selected={singleSelections}
            placeholder="Enter Track Name..."
            renderMenuItemChildren={(option, props) => (
                <span>{option.TrackName}</span>
            )}
        />
    );
};

export default function InstantPlay(props) {
    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle a instantPlay
    const handleOnSubmit = (values, actions) => {
        // axios post request to play song
        axios
            .post(`${PLAY_URI}/${values.TrackID}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // mutate now playing
                mutate(`${STATUS_URI}/playing`);
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                    actions.setSubmitting(false);
                    // set loading to false
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Formik
                validationSchema={schema}
                initialValues={{
                    TrackID: "",
                }}
                onSubmit={handleOnSubmit}
            >
                {({
                    handleSubmit,
                    handleChange,
                    values,
                    errors,
                    isSubmitting,
                }) => (
                    <div>
                        <Form noValidate onSubmit={handleSubmit}>
                            <Form.Row>
                                <Col md={12} lg={10}>
                                    {/* track selector group */}
                                    <Form.Group controlId="validationFormik05">
                                        <TrackSelector name="TrackID" />

                                        {errors.TrackID}
                                    </Form.Group>
                                </Col>
                                <Col md={12} lg={2}>
                                    {/* Submit button*/}
                                    {isSubmitting ? (
                                        <Button type="submit" disabled>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="mr-2"
                                            />
                                        </Button>
                                    ) : (
                                        <Button type="submit">Play</Button>
                                    )}
                                </Col>
                            </Form.Row>

                            {/* display errors to the user */}
                            {serverState.show && (
                                <StickyError
                                    variant={
                                        !serverState.error
                                            ? "warning"
                                            : "danger"
                                    }
                                    text={serverState.message}
                                />
                            )}
                        </Form>
                    </div>
                )}
            </Formik>
        </>
    );
}

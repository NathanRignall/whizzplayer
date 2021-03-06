import Layout from "../components/layouts/unified";
import { useAppContext } from "../components/context/state";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import {
    UploadTrackModal,
    TrackEditModal,
    TrackDeleteModal,
} from "../components/custom/manageTracks";

import { Card, Col, Row, Spinner, Button, Alert, Badge } from "react-bootstrap";

// card for displyaing info about a track
const Track = (props) => {
    // global app context
    const context = useAppContext();

    return (
        <>
            <Card>
                <Card.Header className="bg-secondary text-white">
                    <h4 className="d-inline">{props.info.TrackName}</h4>
                    <Badge
                        className="ml-2"
                        variant={
                            props.info.TrackType == "music" ? "warning" : "info"
                        }
                    >
                        {props.info.TrackType}
                    </Badge>
                </Card.Header>

                <Card.Body>
                    <div className="text-center">
                        <audio controls>
                            <source
                                src={"/api/uploads/save/" + props.info.TrackID}
                                type="audio/mpeg"
                            />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    {context.Access != 0 ? (
                        <>
                            <br />

                            <div className="text-right">
                                <TrackEditModal info={props.info} />{" "}
                                <TrackDeleteModal info={props.info} />
                            </div>
                        </>
                    ) : null}
                </Card.Body>
            </Card>
            <br />
        </>
    );
};

// main track list loader
const TrackList = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/tracks",
        fetcher
    );

    if (data) {
        const TracksFormedList = data.payload.map((item) => (
            <Col key={item.TrackID} xs={12} md={6}>
                <Track info={item} />
            </Col>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                {data.payload.length > 0 ? (
                    <Row>{TracksFormedList}</Row>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 Tracks in the system.
                    </Alert>
                )}
            </>
        );
    } else {
        return (
            <>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>

                <ErrorDisplayer error={error} />
            </>
        );
    }
};

const UploadTrack = () => {
    // global app context
    const context = useAppContext();

    return (
        <>
            {context.Access != 0 ? (
                <div className="ml-auto my-auto">
                    <UploadTrackModal />
                </div>
            ) : null}
        </>
    );
};

// main app function
export default function Main() {
    return (
        <Layout title="Tracks" access={0}>
            <div className="d-flex">
                <h1>Track List</h1>

                <UploadTrack />
            </div>

            <br />

            <TrackList />
        </Layout>
    );
}

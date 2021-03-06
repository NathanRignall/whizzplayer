import Layout from "../../../components/layouts/unified";

import useSWR, { mutate } from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import axios from "axios";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer, StickyError } from "../../../components/common/errors";
import {
    GridDeleteModal,
    GridItemCreateModal,
    GridItemEditModal,
    GridItemDeleteModal,
    GridInfoCard,
} from "../../../components/custom/manageGrids";

import { Badge, Button, Spinner } from "react-bootstrap";

// axios request urls
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/grids";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ViewGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            items: props.Items.map(function (item, key, list) {
                return {
                    i: item.GridItemID.toString(),
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 2,
                    name: item.GridItemName,
                    colour: item.GridItemColour,
                    trackID: item.TrackID,
                    trackName: item.TrackName,
                };
            }),
            layouts: JSON.parse(props.Grid.Layout),
            serverStateLayout: {
                show: false,
                error: false,
                message: "none",
            },
            editMode: true,
        };
        this.editModeManual = this.editModeManual.bind(this);
    }

    editModeManual(mode) {
        this.setState({
            editMode: mode,
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.Items !== this.props.Items) {
            this.setState({
                items: this.props.Items.map(function (item, key, list) {
                    return {
                        i: item.GridItemID.toString(),
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.GridItemName,
                        colour: item.GridItemColour,
                        trackID: item.TrackID,
                        trackName: item.TrackName,
                    };
                }),
            });
        }
    }

    createElement(el) {
        const itemStyle = {
            backgroundColor: el.colour,
        };

        const removeStyle = {
            position: "absolute",
            right: "5px",
            top: "5px",
            cursor: "pointer",
        };

        const editStyle = {
            position: "absolute",
            left: "5px",
            top: "5px",
            cursor: "pointer",
        };

        const i = el.i;
        const name = el.name;
        const colour = el.colour;
        const trackID = el.trackID;
        const trackName = el.trackName;

        return (
            <div key={i} data-grid={el} style={itemStyle}>
                <div className="d-flex h-100 align-items-center justify-content-center">
                    <div>
                        <h3>{name}</h3>

                        <Button size="lg" variant="light" disabled>
                            Instant Play
                        </Button>
                    </div>
                </div>

                <span className="remove" style={removeStyle}>
                    <GridItemDeleteModal
                        GridID={this.props.GridID}
                        info={{ GridItemID: i, GridItemName: name }}
                        editModeManual={this.editModeManual}
                    />
                </span>

                <span className="edit" style={editStyle}>
                    <GridItemEditModal
                        GridID={this.props.GridID}
                        info={{
                            GridItemID: i,
                            GridItemName: name,
                            GridItemColour: colour,
                            TrackID: trackID,
                            TrackName: trackName,
                        }}
                        editModeManual={this.editModeManual}
                    />
                </span>
            </div>
        );
    }

    onLayoutChange(layout, layouts) {
        //saveToLS("layouts", layouts);
        this.setState({ layouts: layouts });
        // create the json object to post layout
        const json = JSON.stringify({
            layout: layouts,
        });
        // axios put request to save layout
        axios
            .put(`${GRIDS_URI}/${this.props.GridID}/layout`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                this.setState({
                    serverStateLayout: {
                        show: false,
                        error: false,
                        message: response.data.message,
                    },
                });
                // reload
                mutate(`${GRIDS_URI}/${this.props.GridID}/items`);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: error.response.data.message,
                            },
                        });
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: "Error fetching api",
                            },
                        });
                    } else {
                        // check if a user error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: false,
                                message: error.response.data.message,
                            },
                        });
                    }
                } else if (error.request) {
                    // check if a request error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error sending request to server",
                        },
                    });
                } else {
                    // check if a browser error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error in browser request",
                        },
                    });
                    console.log(error);
                }
            });
    }

    render() {
        return (
            <div>
                <div className="d-flex flex-lg-row flex-column">
                    <h1>{this.props.Grid.GridName}</h1>

                    <div className="ml-lg-auto my-auto">
                        <GridItemCreateModal
                            AddItem={this.onAddItem}
                            GridID={this.props.Grid.GridID}
                        />{" "}
                        <GridDeleteModal
                            GridID={this.props.GridID}
                            info={{ GridName: this.props.Grid.GridName }}
                        />{" "}
                        <Link
                            href={{
                                pathname: "/grids/[id]",
                                query: { id: this.props.Grid.GridID },
                            }}
                        >
                            <Button
                                href={"/grids/" + this.props.Grid.GridID}
                                variant="success"
                            >
                                Finish Editing
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button variant="outline-primary" href="/grids">
                                All Grids
                            </Button>
                        </Link>
                    </div>
                </div>

                <br />
                <GridInfoCard />

                <br />
                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={this.state.editMode}
                    isResizable={this.state.editMode}
                    containerPadding={[0, 0]}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {_.map(this.state.items, (el) => this.createElement(el))}
                </ResponsiveReactGridLayout>

                {/* display errors to the user */}
                {this.state.serverStateLayout.show && (
                    <StickyError
                        variant={
                            !this.state.serverStateLayout.error
                                ? "warning"
                                : "danger"
                        }
                        text={this.state.serverStateLayout.message}
                    />
                )}
            </div>
        );
    }
}

// main grid loader
const Grid = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL +
            "/app/grids/" +
            props.GridID +
            "/items",
        fetcher
    );

    if (data) {
        return (
            <>
                <ErrorDisplayer error={error} />

                <ViewGrid
                    Items={data.payload.items}
                    Grid={data.payload.grid}
                    GridID={props.GridID}
                ></ViewGrid>
            </>
        );
    } else {
        return (
            <>
                <ErrorDisplayer error={error} />

                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </>
        );
    }
};

// main app function
export default function Main() {
    const router = useRouter();
    const { id } = router.query;

    if (id) {
        return (
            <Layout title="Grids" access={5}>
                <Grid GridID={id} />
            </Layout>
        );
    } else {
        return (
            <Layout title="Grids" access={5}>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </Layout>
        );
    }
}

import Layout from "../../../components/layouts/main";

import useSWR, { mutate } from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import axios from "axios";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer, StickyError } from "../../../components/common/errors";

import { Card, Button, Nav, Spinner } from "react-bootstrap";

// axios request urls
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/grids";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ResponsiveLocalStorageLayout extends React.PureComponent {
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
                };
            }),
            newCounter: 0,
            layouts: JSON.parse(props.Grid.Layout),
            serverStateLayout: {
                show: false,
                error: false,
                message: "none",
            },
        };
    }

    createElement(el) {
        const removeStyle = {
            position: "absolute",
            right: "2px",
            top: 0,
            cursor: "pointer",
        };

        const i = el.i;
        const name = el.name;

        return (
            <div key={i} data-grid={el}>
                <span className="text">{i}</span>

                <div className="wrap">
                    <h3>{name}</h3>
                    <Button disabled variant="primary">
                        Play
                    </Button>
                </div>
            </div>
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.Items !== this.props.Items) {
            console.log("updated items map");
            this.setState({
                items: this.props.Items.map(function (item, key, list) {
                    return {
                        i: item.GridItemID.toString(),
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.GridItemName,
                    };
                }),
            });
        }
    }

    render() {
        return (
            <div>
                <div class="d-flex">
                    <h1>{this.props.Grid.GridName}</h1>

                    <div class="ml-auto my-auto">
                        <Link
                            href={{
                                pathname: "/grids/[id]/test",
                                query: { id: this.props.GridID },
                            }}
                        >
                            <Button
                                href={"/grids/" + this.props.GridID + "/test"}
                                variant="warning"
                            >
                                Edit Grid
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button href="/grids">All Grids</Button>
                        </Link>
                    </div>
                </div>

                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={false}
                    isResizable={false}
                    rowHeight={100}
                    layouts={this.state.layouts}
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
function getFromLS(key) {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

const GridItem = (props) => (
    <div className="wrap">
        <h3>{props.info.GridItemName}</h3>
        <Button variant="primary">Go somewhere 5</Button>
    </div>
);

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
        const GridFormedList = data.payload.items.map((item) => (
            <div
                key={item.GridItemID}
                data-grid={{ w: 2, h: 2, x: 0, y: 0, minW: 2, minH: 2 }}
            >
                <GridItem info={item} />
            </div>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                {data.payload.items.length > 0 ? (
                    <ResponsiveLocalStorageLayout
                        Items={data.payload.items}
                        Grid={data.payload.grid}
                        GridID={props.GridID}
                    >
                        {GridFormedList}
                    </ResponsiveLocalStorageLayout>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 items in this grid
                    </Alert>
                )}
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

    return (
        <Layout title="Grids">
            <Grid GridID={id} />
        </Layout>
    );
}

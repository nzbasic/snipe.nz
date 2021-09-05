import React, { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import {
  ResponsiveContainer,
  CartesianGrid,
  Line,
  Label,
  Brush,
  Tooltip,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ payload, label, active }: any) => {
    if (active && payload.length) {
      return (
        <div className="text-white bg-black rounded-md p-4">
            <p className="label">
                {moment(label).format("DD M YY") + " : " + payload[0].value}
            </p>
        </div>
      );
    }
  
    return null;
}

export const TimeSeriesChart = ({ chartData, brush, title }: { chartData: any[], brush: boolean, title: boolean }) => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-white justify-center pt-6 pb-6 pr-6 rounded-md">
      {title && <span className="relative top-2">Country #1s over time</span>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            domain={["dataMin", "dataMax"]}
            name="Date"
            tickFormatter={(unixTime) => moment(unixTime).format("MMM Do YY")}
            type="number"
          />
          <YAxis
            dataKey="total"
            name="pp"
            domain={["auto", "auto"]}
            tickFormatter={(item) => Math.floor(item) + ""}
          />
          {brush &&
            <Brush
                dataKey="time"
                height={30}
                travellerWidth={50}
                stroke={"black"}
                tickFormatter={(unixTime) => moment(unixTime).format("MMM Do YY")}
            />
          }
          <Tooltip content={<CustomTooltip />} />
          <Line
            strokeWidth={2}
            dataKey="total"
            type="monotone"
            stroke="#c91a34"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

TimeSeriesChart.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.number,
      value: PropTypes.number,
    })
  ).isRequired,
};
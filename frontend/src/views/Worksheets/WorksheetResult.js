import * as ReactIf from 'react-if';
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { FaBars } from 'react-icons/all';
import React from 'react';
import PropTypes from 'prop-types';
import Scrollbar from '../../components/Scrollbar';

const WorksheetResult = ({ results, loading }) => {
  if (loading) {
    return <CircularProgress />;
  }
  if (results && results.Error) {
    return (
      <Paper>
        {results.Error}
      </Paper>
    );
  }
  return (
    <ReactIf.If condition={results && results.columns}>
      <ReactIf.Then>
        <Card sx={{ maxWidth: 1140 }}>
          <CardHeader
            title={(
              <Box>
                <FaBars />
                {' '}
                Query Results
              </Box>
                )}
          />
          <Divider />
          <Scrollbar>
            <Box>
              <Table
                stickyHeader
                aria-label="sticky table"
              >
                <TableHead>
                  <TableRow>
                    {
                      results && results.columns && results.columns && results.columns.map((col) => (
                        <TableCell>
                          {col.columnName}
                        </TableCell>
                      ))
                    }
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    results && results.rows && results.rows.map((row) => (
                      <TableRow>
                        {
                          row.cells.map((cell) => (
                            <TableCell>
                              {cell.value}
                            </TableCell>
                          ))
                        }
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          </Scrollbar>
        </Card>
      </ReactIf.Then>
    </ReactIf.If>
  );
};
WorksheetResult.propTypes = {
  results: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};
export default WorksheetResult;

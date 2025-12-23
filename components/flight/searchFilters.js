import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowRightLeft, Filter, X } from "lucide-react";

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
];
const airlines = ["Air India", "IndiGo", "SpiceJet", "Vistara"];

export default function SearchFilters({
  filters,
  setFilters,
  onSearch,
  onClear,
}) {
  return (
    <Card className="p-6 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-slate-600" />
        <h3 className="font-semibold text-slate-900">
          Search & Filter Flights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-600 text-sm">From</Label>
          <Select
            value={filters.departure}
            onValueChange={(value) =>
              setFilters({ ...filters, departure: value })
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Departure City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 text-sm">To</Label>
          <Select
            value={filters.arrival}
            onValueChange={(value) =>
              setFilters({ ...filters, arrival: value })
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Arrival City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 text-sm">Airline</Label>
          <Select
            value={filters.airline}
            onValueChange={(value) =>
              setFilters({ ...filters, airline: value })
            }
          >
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="All Airlines" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Airlines</SelectItem>
              {airlines.map((airline) => (
                <SelectItem key={airline} value={airline}>
                  {airline}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 text-sm">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="departure">Departure Time</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={onSearch}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            className="border-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

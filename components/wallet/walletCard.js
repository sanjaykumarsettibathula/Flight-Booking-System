import React from "react";
import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function WalletCard({ balance, recentTransactions = [] }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm">Wallet Balance</p>
            <motion.p
              key={balance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold"
            >
              ₹{balance.toLocaleString()}
            </motion.p>
          </div>
        </div>
      </div>

      {recentTransactions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            Recent Activity
          </p>
          {recentTransactions.slice(0, 3).map((txn, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 border-t border-slate-700"
            >
              <div className="flex items-center gap-2">
                {txn.type === "debit" ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                )}
                <span className="text-sm">{txn.description}</span>
              </div>
              <span
                className={`font-medium ${
                  txn.type === "debit" ? "text-red-400" : "text-green-400"
                }`}
              >
                {txn.type === "debit" ? "-" : "+"}₹{txn.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
